from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_admin
from app.models.lotto_draw import LottoDraw
from app.models.user import User
from app.repositories import lotto_repo
from app.schemas.admin import AdminFlagUpdate, AdminUserOut, DrawCreate
from app.schemas.lotto import LottoDrawOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/draws", response_model=LottoDrawOut)
def upsert_draw(
    req: DrawCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """Create or correct a single draw's winning numbers (admin only)."""
    n1, n2, n3, n4, n5, n6 = req.numbers
    draw = lotto_repo.get_draw(db, req.draw_no)
    if draw is None:
        draw = LottoDraw(draw_no=req.draw_no)
        db.add(draw)
    draw.draw_date = req.draw_date
    draw.number_1, draw.number_2, draw.number_3 = n1, n2, n3
    draw.number_4, draw.number_5, draw.number_6 = n4, n5, n6
    draw.bonus_number = req.bonus_number
    db.commit()
    db.refresh(draw)
    return LottoDrawOut(
        draw_no=draw.draw_no,
        draw_date=draw.draw_date,
        numbers=draw.numbers,
        bonus_number=draw.bonus_number,
    )


@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    rows = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [AdminUserOut.model_validate(u) for u in rows]


@router.patch("/users/{user_id}", response_model=AdminUserOut)
def set_admin_flag(
    user_id: int,
    req: AdminFlagUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if user_id == admin.id and not req.is_admin:
        # Prevent self-demotion to avoid accidentally locking out admins.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="본인의 관리자 권한은 해제할 수 없습니다",
        )
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다"
        )
    target.is_admin = req.is_admin
    db.commit()
    db.refresh(target)
    return AdminUserOut.model_validate(target)
