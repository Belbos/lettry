from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.statistics_cache import JSONType


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    preset_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("user_algorithm_presets.id", ondelete="SET NULL"),
        nullable=True,
    )
    recommended_numbers_json: Mapped[dict] = mapped_column(JSONType, nullable=False)
    algorithm_steps_json: Mapped[list] = mapped_column(JSONType, nullable=False)
    filters_json: Mapped[dict] = mapped_column(JSONType, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
