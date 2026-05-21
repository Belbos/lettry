from __future__ import annotations

from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter


class ConsecutiveFilter(NumberFilter):
    """If allow=False, no two consecutive numbers may appear."""
    name = "consecutive"

    def __init__(self, allow: bool):
        self.allow = allow

    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool:
        if self.allow:
            return True
        s = sorted(numbers)
        for a, b in zip(s, s[1:]):
            if b - a == 1:
                return False
        return True
