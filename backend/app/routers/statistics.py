from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.statistics import (
    HotColdResponse,
    NumberFrequencyResponse,
    OverdueResponse,
    PairResponse,
    StatisticsSummary,
    StatRange,
)
from app.services.statistics import frequency as freq_svc
from app.services.statistics import hot_cold as hotcold_svc
from app.services.statistics import overdue as overdue_svc
from app.services.statistics import pairs as pairs_svc
from app.services.statistics import summary as summary_svc

router = APIRouter(prefix="/api/statistics", tags=["statistics"])


@router.get("/number-frequency", response_model=NumberFrequencyResponse)
def number_frequency(
    range: StatRange = Query("all"),
    db: Session = Depends(get_db),
):
    return freq_svc.number_frequency(db, range)


@router.get("/hot", response_model=HotColdResponse)
def hot(
    range: StatRange = Query("last_20"),
    limit: int = Query(6, ge=1, le=45),
    db: Session = Depends(get_db),
):
    return hotcold_svc.hot(db, range, limit)


@router.get("/cold", response_model=HotColdResponse)
def cold(
    range: StatRange = Query("last_20"),
    limit: int = Query(6, ge=1, le=45),
    db: Session = Depends(get_db),
):
    return hotcold_svc.cold(db, range, limit)


@router.get("/summary", response_model=StatisticsSummary)
def summary(db: Session = Depends(get_db)):
    return summary_svc.summary(db)


@router.get("/overdue", response_model=OverdueResponse)
def overdue(db: Session = Depends(get_db)):
    return overdue_svc.overdue(db)


@router.get("/pairs", response_model=PairResponse)
def pairs(
    range: StatRange = Query("all"),
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return pairs_svc.top_pairs(db, range, limit)
