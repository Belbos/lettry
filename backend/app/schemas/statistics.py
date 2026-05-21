from typing import Literal

from pydantic import BaseModel

StatRange = Literal["all", "last_20", "last_50", "last_100"]


class NumberFrequencyItem(BaseModel):
    number: int
    count: int


class NumberFrequencyResponse(BaseModel):
    range: StatRange
    total_draws: int
    items: list[NumberFrequencyItem]


class HotColdItem(BaseModel):
    number: int
    count: int
    rank: int


class HotColdResponse(BaseModel):
    range: StatRange
    items: list[HotColdItem]


class SumDistributionBucket(BaseModel):
    bucket: str   # e.g. "100-119"
    count: int


class StatisticsSummary(BaseModel):
    total_draws: int
    odd_even_avg: tuple[float, float]   # average odd count, even count
    low_high_avg: tuple[float, float]
    sum_min: int
    sum_max: int
    sum_avg: float
    sum_distribution: list[SumDistributionBucket]
    consecutive_pair_avg: float
