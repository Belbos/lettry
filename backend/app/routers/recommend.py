from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.recommendation import (
    RecommendFilters,
    RecommendRequest,
    RecommendResponse,
    RecommendSummary,
    StepResult,
)
from app.services.recommendation.block_registry import build_block
from app.services.recommendation.engine import (
    FilterUnsatisfiableError,
    RecommendationEngine,
)
from app.services.recommendation.filters.base import NumberFilter
from app.services.recommendation.filters.consecutive_filter import ConsecutiveFilter
from app.services.recommendation.filters.last_digit_filter import LastDigitFilter
from app.services.recommendation.filters.low_high_filter import LowHighFilter
from app.services.recommendation.filters.odd_even_filter import OddEvenFilter
from app.services.recommendation.filters.past_combination_filter import PastCombinationFilter
from app.services.recommendation.filters.sum_range_filter import SumRangeFilter
from app.services.statistics.snapshot import StatisticsSnapshotBuilder
from app.utils.disclaimers import RECOMMENDATION_DISCLAIMER

router = APIRouter(prefix="/api/recommend", tags=["recommend"])


def _build_filters(cfg: RecommendFilters) -> list[NumberFilter]:
    filters: list[NumberFilter] = []
    if cfg.oddEvenRatio:
        filters.append(OddEvenFilter(cfg.oddEvenRatio[0], cfg.oddEvenRatio[1]))
    if cfg.lowHighRatio:
        filters.append(LowHighFilter(cfg.lowHighRatio[0], cfg.lowHighRatio[1]))
    if cfg.sumRange:
        filters.append(SumRangeFilter(cfg.sumRange[0], cfg.sumRange[1]))
    if cfg.allowConsecutive is False:
        filters.append(ConsecutiveFilter(allow=False))
    if cfg.maxSameLastDigit is not None:
        filters.append(LastDigitFilter(cfg.maxSameLastDigit))
    if cfg.excludePastWinningCombination:
        filters.append(PastCombinationFilter())
    return filters


@router.post("", response_model=RecommendResponse)
def recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    # Snapshot construction (single DB scan), with ranges needed by any hot/cold step.
    needed_ranges = sorted({
        s.recentRounds for s in req.steps
        if getattr(s, "recentRounds", None)
    } | {20, 50, 100})

    snapshot = StatisticsSnapshotBuilder(db=db, ranges=needed_ranges).build(
        include_past_sets=req.filters.excludePastWinningCombination
    )

    blocks = [build_block(s.model_dump(by_alias=True)) for s in req.steps]
    filters = _build_filters(req.filters)

    engine = RecommendationEngine(blocks=blocks, filters=filters, statistics=snapshot)
    try:
        result = engine.run(req.model_dump(by_alias=True), seed=req.seed)
    except FilterUnsatisfiableError as e:
        raise HTTPException(status_code=409, detail={
            "code": "RECOMMEND_FILTER_UNSATISFIABLE",
            "message": str(e),
        })

    return RecommendResponse(
        numbers=result.numbers,
        summary=RecommendSummary(**result.summary),
        appliedSteps=result.appliedSteps,
        stepResults=[StepResult(**sr) for sr in result.stepResults],
        disclaimer=RECOMMENDATION_DISCLAIMER,
    )
