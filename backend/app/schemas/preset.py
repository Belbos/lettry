from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class PresetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    config: dict[str, Any]
    isDefault: bool = False


class PresetUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    config: dict[str, Any]


class PresetOut(BaseModel):
    id: int
    name: str
    config: dict[str, Any]
    isDefault: bool
    createdAt: datetime
    updatedAt: datetime
