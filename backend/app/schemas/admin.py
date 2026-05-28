from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, model_validator


class DrawCreate(BaseModel):
    draw_no: int = Field(..., ge=1)
    draw_date: date
    numbers: list[int] = Field(..., min_length=6, max_length=6)
    bonus_number: int = Field(..., ge=1, le=45)

    @field_validator("numbers")
    @classmethod
    def numbers_valid(cls, v: list[int]) -> list[int]:
        if any(n < 1 or n > 45 for n in v):
            raise ValueError("번호는 1~45 사이여야 합니다")
        if len(set(v)) != 6:
            raise ValueError("번호 6개는 서로 달라야 합니다")
        return sorted(v)

    @model_validator(mode="after")
    def bonus_distinct(self):
        if self.bonus_number in self.numbers:
            raise ValueError("보너스 번호는 본번호와 달라야 합니다")
        return self


class AdminUserOut(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminFlagUpdate(BaseModel):
    is_admin: bool
