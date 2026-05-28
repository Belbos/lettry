from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.preset import UserAlgorithmPreset
from app.models.user import User
from app.schemas.preset import PresetCreate, PresetOut, PresetUpdate

router = APIRouter(prefix="/api/presets", tags=["presets"])


def _to_out(p: UserAlgorithmPreset) -> PresetOut:
    return PresetOut(
        id=p.id,
        name=p.preset_name,
        config=p.preset_config_json,
        isDefault=p.is_default,
        createdAt=p.created_at,
        updatedAt=p.updated_at,
    )


def _get_owned(db: Session, user: User, preset_id: int) -> UserAlgorithmPreset:
    preset = db.get(UserAlgorithmPreset, preset_id)
    if preset is None or preset.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="프리셋을 찾을 수 없습니다"
        )
    return preset


@router.get("", response_model=list[PresetOut])
def list_presets(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(UserAlgorithmPreset)
        .where(UserAlgorithmPreset.user_id == user.id)
        .order_by(UserAlgorithmPreset.created_at.desc())
    ).all()
    return [_to_out(p) for p in rows]


@router.post("", response_model=PresetOut, status_code=201)
def create_preset(
    req: PresetCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    has_any = db.scalar(
        select(UserAlgorithmPreset.id).where(UserAlgorithmPreset.user_id == user.id)
    )
    make_default = req.isDefault or has_any is None
    if make_default:
        _clear_defaults(db, user)
    preset = UserAlgorithmPreset(
        user_id=user.id,
        preset_name=req.name.strip() or "이름 없음",
        preset_config_json=req.config,
        is_default=make_default,
    )
    db.add(preset)
    db.commit()
    db.refresh(preset)
    return _to_out(preset)


@router.put("/{preset_id}", response_model=PresetOut)
def update_preset(
    preset_id: int,
    req: PresetUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    preset = _get_owned(db, user, preset_id)
    preset.preset_name = req.name.strip() or preset.preset_name
    preset.preset_config_json = req.config
    db.commit()
    db.refresh(preset)
    return _to_out(preset)


@router.delete("/{preset_id}", status_code=204)
def delete_preset(
    preset_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    preset = _get_owned(db, user, preset_id)
    db.delete(preset)
    db.commit()


@router.post("/{preset_id}/default", response_model=PresetOut)
def set_default(
    preset_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    preset = _get_owned(db, user, preset_id)
    _clear_defaults(db, user)
    preset.is_default = True
    db.commit()
    db.refresh(preset)
    return _to_out(preset)


def _clear_defaults(db: Session, user: User) -> None:
    rows = db.scalars(
        select(UserAlgorithmPreset).where(
            UserAlgorithmPreset.user_id == user.id,
            UserAlgorithmPreset.is_default.is_(True),
        )
    ).all()
    for r in rows:
        r.is_default = False
