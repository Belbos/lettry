from __future__ import annotations

from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter


class SumRangeFilter(NumberFilter):
    name = "sum_range"

    def __init__(self, min_sum: int, max_sum: int):
        self.min_sum = min_sum
        self.max_sum = max_sum

    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool:
        s = sum(numbers)
        return self.min_sum <= s <= self.max_sum
