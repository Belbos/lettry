from datetime import datetime

from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.database import Base

# JSONB on PostgreSQL, JSON on SQLite/others
JSONType = JSON().with_variant(JSONB(), "postgresql")


class NumberStatisticsCache(Base):
    __tablename__ = "number_statistics_cache"
    __table_args__ = (
        UniqueConstraint("stat_type", "stat_range", name="uq_stat"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stat_type: Mapped[str] = mapped_column(String(40), nullable=False)
    stat_range: Mapped[str] = mapped_column(String(40), nullable=False)
    stat_data_json: Mapped[dict] = mapped_column(JSONType, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
