from __future__ import annotations

from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter
from app.utils.lotto_rules import LOW_HIGH_BOUNDARY


class LowHighFilter(NumberFilter):
    name = "low_high"

    def __init__(self, low: int, high: int):
        self.low = low
        self.high = high

    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool:
        low = sum(1 for n in numbers if n <= LOW_HIGH_BOUNDARY)
        return low == self.low and (len(numbers) - low) == self.high
