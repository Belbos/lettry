from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.lotto_draw import LottoDraw


def list_draws(db: Session, limit: int = 50, offset: int = 0) -> list[LottoDraw]:
    stmt = (select(LottoDraw)
            .order_by(LottoDraw.draw_no.desc())
            .limit(limit).offset(offset))
    return list(db.scalars(stmt))


def get_draw(db: Session, draw_no: int) -> LottoDraw | None:
    return db.scalar(select(LottoDraw).where(LottoDraw.draw_no == draw_no))


def latest_n(db: Session, n: int) -> list[LottoDraw]:
    """Return the latest n draws ordered by draw_no DESC."""
    stmt = select(LottoDraw).order_by(LottoDraw.draw_no.desc()).limit(n)
    return list(db.scalars(stmt))


def all_draws(db: Session) -> list[LottoDraw]:
    return list(db.scalars(select(LottoDraw).order_by(LottoDraw.draw_no.asc())))


def count(db: Session) -> int:
    return db.scalar(select(func.count(LottoDraw.id))) or 0


def bulk_insert(db: Session, rows: list[dict]) -> int:
    """Insert only rows whose draw_no does not already exist. Returns inserted count."""
    inserted = 0
    existing = set(db.scalars(select(LottoDraw.draw_no)).all())
    for r in rows:
        if r["draw_no"] in existing:
            continue
        db.add(LottoDraw(**r))
        existing.add(r["draw_no"])
        inserted += 1
    db.commit()
    return inserted
