from __future__ import annotations

from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter


class PastCombinationFilter(NumberFilter):
    """Reject combinations that exactly match a past winning set."""
    name = "past_combination"

    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool:
        return frozenset(numbers) not in ctx.statistics.past_winning_sets
