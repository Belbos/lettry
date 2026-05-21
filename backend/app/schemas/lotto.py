from datetime import date

from pydantic import BaseModel, Field


class LottoDrawOut(BaseModel):
    draw_no: int
    draw_date: date
    numbers: list[int] = Field(..., min_length=6, max_length=6)
    bonus_number: int

    class Config:
        from_attributes = True
