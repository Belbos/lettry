from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.check import CheckRequest, CheckResponse, DrawMatchOut
from app.services.check import DrawMatch, check_numbers

router = APIRouter(prefix="/api/check", tags=["check"])


def _to_out(m: DrawMatch | None) -> DrawMatchOut | None:
    if m is None:
        return None
    return DrawMatchOut(
        drawNo=m.draw_no,
        drawDate=m.draw_date,
        matchCount=m.match_count,
        bonusMatch=m.bonus_match,
        rank=m.rank,
    )


@router.post("", response_model=CheckResponse)
def check(req: CheckRequest, db: Session = Depends(get_db)):
    result = check_numbers(db, req.numbers, req.draw_no)
    return CheckResponse(
        numbers=req.numbers,
        totalDraws=result.total_draws,
        rankCounts={str(k): v for k, v in result.rank_counts.items()},
        best=_to_out(result.best),
        target=_to_out(result.target),
    )
