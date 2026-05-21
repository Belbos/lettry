from __future__ import annotations

from abc import ABC, abstractmethod
from typing import ClassVar

from app.services.recommendation.context import RecommendationContext


class RecommendationBlock(ABC):
    """Common interface for every recommendation block.

    Each block partially fills `ctx.selected` (up to 6 numbers) and returns
    the updated context. Blocks must respect `ctx.excluded` and never go over 6.
    """
    type: ClassVar[str] = ""

    def __init__(self, config: dict):
        self.config = config

    @abstractmethod
    def execute(self, ctx: RecommendationContext) -> RecommendationContext: ...

    @staticmethod
    def _capped(want: int, ctx: RecommendationContext) -> int:
        """Don't ask for more numbers than 6 - currently selected."""
        return max(0, min(want, 6 - len(ctx.selected)))
