from __future__ import annotations

from collections import Counter

from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter


class LastDigitFilter(NumberFilter):
    """At most `max_same` numbers may share the same last digit."""
    name = "last_digit"

    def __init__(self, max_same: int):
        self.max_same = max_same

    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool:
        c = Counter(n % 10 for n in numbers)
        return max(c.values(), default=0) <= self.max_same
