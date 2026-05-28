from pydantic import BaseModel, Field, field_validator


class CheckRequest(BaseModel):
    numbers: list[int] = Field(..., min_length=6, max_length=6)
    draw_no: int | None = Field(None, ge=1)

    @field_validator("numbers")
    @classmethod
    def numbers_valid(cls, v: list[int]) -> list[int]:
        if any(n < 1 or n > 45 for n in v):
            raise ValueError("번호는 1~45 사이여야 합니다")
        if len(set(v)) != 6:
            raise ValueError("번호 6개는 서로 달라야 합니다")
        return sorted(v)


class DrawMatchOut(BaseModel):
    drawNo: int
    drawDate: str
    matchCount: int
    bonusMatch: bool
    rank: int | None


class CheckResponse(BaseModel):
    numbers: list[int]
    totalDraws: int
    rankCounts: dict[str, int]
    best: DrawMatchOut | None
    target: DrawMatchOut | None
