from __future__ import annotations

from abc import ABC, abstractmethod
from typing import ClassVar

from app.services.recommendation.context import RecommendationContext


class NumberFilter(ABC):
    name: ClassVar[str] = ""

    @abstractmethod
    def validate(self, numbers: list[int], ctx: RecommendationContext) -> bool: ...
