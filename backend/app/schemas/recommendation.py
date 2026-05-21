from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


class HotStep(BaseModel):
    type: Literal["hot"]
    recentRounds: int = Field(20, ge=1, le=10000)
    count: int = Field(..., ge=1, le=6)


class ColdStep(BaseModel):
    type: Literal["cold"]
    recentRounds: int = Field(20, ge=1, le=10000)
    count: int = Field(..., ge=1, le=6)


class WeightRange(BaseModel):
    from_: int = Field(..., ge=1, le=45, alias="from")
    to: int = Field(..., ge=1, le=45)
    weight: float = Field(..., gt=0)

    model_config = {"populate_by_name": True}


class WeightedRandomStep(BaseModel):
    type: Literal["weighted_random"]
    count: int = Field(..., ge=1, le=6)
    weights: list[WeightRange] = Field(default_factory=list)


class RandomStep(BaseModel):
    type: Literal["random"]
    count: int = Field(..., ge=1, le=6)


Step = Annotated[
    Union[HotStep, ColdStep, WeightedRandomStep, RandomStep],
    Field(discriminator="type"),
]


class RecommendFilters(BaseModel):
    oddEvenRatio: tuple[int, int] | None = None
    lowHighRatio: tuple[int, int] | None = None
    sumRange: tuple[int, int] | None = None
    allowConsecutive: bool = True
    maxSameLastDigit: int | None = Field(None, ge=1, le=6)
    excludePastWinningCombination: bool = False


class RecommendRequest(BaseModel):
    steps: list[Step] = Field(..., min_length=1)
    filters: RecommendFilters = Field(default_factory=RecommendFilters)
    seed: int | None = None


class RecommendSummary(BaseModel):
    oddCount: int
    evenCount: int
    lowCount: int
    highCount: int
    sum: int
    consecutivePairs: int


class StepResult(BaseModel):
    type: str
    pickedNumbers: list[int] = Field(default_factory=list)
    note: str | None = None


class RecommendResponse(BaseModel):
    numbers: list[int]
    summary: RecommendSummary
    appliedSteps: list[str]
    stepResults: list[StepResult]
    disclaimer: str
