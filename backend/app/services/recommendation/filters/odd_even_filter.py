from __future__ import annotations

from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter


class OddEvenFilter(NumberFilter):
    name = "odd_even"

    def __init__(self, odd: int, even: int):
        self.odd = odd
        self.even = even

    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool:
        odd = sum(1 for n in numbers if n % 2 == 1)
        return odd == self.odd and (len(numbers) - odd) == self.even
