from __future__ import annotations

import random
from dataclasses import dataclass, field

from app.services.statistics.snapshot import StatisticsSnapshot


@dataclass
class StepResultLog:
    type: str
    pickedNumbers: list[int] = field(default_factory=list)
    note: str | None = None


@dataclass
class RecommendationContext:
    user_config: dict
    statistics: StatisticsSnapshot
    rng: random.Random
    selected: set[int] = field(default_factory=set)
    excluded: set[int] = field(default_factory=set)
    step_results: list[StepResultLog] = field(default_factory=list)

    def pick(self, n: int) -> None:
        self.selected.add(n)
        self.excluded.add(n)

    @property
    def remaining_pool(self) -> list[int]:
        return [n for n in range(1, 46) if n not in self.excluded]

    @property
    def is_complete(self) -> bool:
        return len(self.selected) == 6
