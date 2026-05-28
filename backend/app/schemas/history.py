from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class HistoryCreate(BaseModel):
    numbers: list[int] = Field(..., min_length=1)
    summary: dict[str, Any]
    appliedSteps: list[str] = Field(default_factory=list)
    presetName: str | None = None
    filters: dict[str, Any] = Field(default_factory=dict)


class HistoryOut(BaseModel):
    id: int
    numbers: list[int]
    summary: dict[str, Any]
    appliedSteps: list[str]
    presetName: str | None
    createdAt: datetime
