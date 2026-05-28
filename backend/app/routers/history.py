from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.recommendation import RecommendationHistory
from app.models.user import User
from app.schemas.history import HistoryCreate, HistoryOut

router = APIRouter(prefix="/api/history", tags=["history"])

MAX_ENTRIES = 100


def _to_out(h: RecommendationHistory) -> HistoryOut:
    payload = h.recommended_numbers_json or {}
    return HistoryOut(
        id=h.id,
        numbers=payload.get("numbers", []),
        summary=payload.get("summary", {}),
        appliedSteps=h.algorithm_steps_json or [],
        presetName=payload.get("presetName"),
        createdAt=h.created_at,
    )


@router.get("", response_model=list[HistoryOut])
def list_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(RecommendationHistory)
        .where(RecommendationHistory.user_id == user.id)
        .order_by(RecommendationHistory.created_at.desc())
        .limit(MAX_ENTRIES)
    ).all()
    return [_to_out(h) for h in rows]


@router.post("", response_model=HistoryOut, status_code=201)
def create_history(
    req: HistoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = RecommendationHistory(
        user_id=user.id,
        recommended_numbers_json={
            "numbers": req.numbers,
            "summary": req.summary,
            "presetName": req.presetName,
        },
        algorithm_steps_json=req.appliedSteps,
        filters_json=req.filters,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_out(entry)


@router.delete("", status_code=204)
def clear_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.execute(
        delete(RecommendationHistory).where(
            RecommendationHistory.user_id == user.id
        )
    )
    db.commit()
