from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.statistics_cache import JSONType


class UserAlgorithmPreset(Base):
    __tablename__ = "user_algorithm_presets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    preset_name: Mapped[str] = mapped_column(String(80), nullable=False)
    preset_config_json: Mapped[dict] = mapped_column(JSONType, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
