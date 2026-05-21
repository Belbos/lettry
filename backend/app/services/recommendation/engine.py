from __future__ import annotations

import os
import random
from dataclasses import dataclass

from app.services.recommendation.blocks.base import RecommendationBlock
from app.services.recommendation.context import RecommendationContext
from app.services.recommendation.filters.base import NumberFilter
from app.services.statistics.snapshot import StatisticsSnapshot
from app.utils.lotto_rules import LOW_HIGH_BOUNDARY


class FilterUnsatisfiableError(RuntimeError):
    pass


@dataclass
class EngineResult:
    numbers: list[int]
    summary: dict
    appliedSteps: list[str]
    stepResults: list[dict]


def _compute_summary(numbers: list[int]) -> dict:
    s = sorted(numbers)
    odd = sum(1 for n in s if n % 2 == 1)
    low = sum(1 for n in s if n <= LOW_HIGH_BOUNDARY)
    consec = sum(1 for a, b in zip(s, s[1:]) if b - a == 1)
    return {
        "oddCount": odd,
        "evenCount": 6 - odd,
        "lowCount": low,
        "highCount": 6 - low,
        "sum": sum(s),
        "consecutivePairs": consec,
    }


class RecommendationEngine:
    MAX_ATTEMPTS = 100

    def __init__(
        self,
        blocks: list[RecommendationBlock],
        filters: list[NumberFilter],
        statistics: StatisticsSnapshot,
    ):
        self.blocks = blocks
        self.filters = filters
        self.statistics = statistics

    def run(self, user_config: dict, seed: int | None = None) -> EngineResult:
        applied_step_types = [b.type for b in self.blocks]
        # filter_validation always appears at the end if not explicitly in pipeline
        if "filter_validation" not in applied_step_types:
            applied_step_types = applied_step_types + ["filter_validation"]

        last_ctx: RecommendationContext | None = None
        for attempt in range(self.MAX_ATTEMPTS):
            attempt_seed = (seed + attempt) if seed is not None else int.from_bytes(os.urandom(8), "big")
            ctx = RecommendationContext(
                user_config=user_config,
                statistics=self.statistics,
                rng=random.Random(attempt_seed),
            )
            for block in self.blocks:
                ctx = block.execute(ctx)
                if len(ctx.selected) >= 6:
                    break

            if len(ctx.selected) != 6:
                last_ctx = ctx
                continue

            numbers = sorted(ctx.selected)
            if all(f.validate(numbers, ctx) for f in self.filters):
                return EngineResult(
                    numbers=numbers,
                    summary=_compute_summary(numbers),
                    appliedSteps=applied_step_types,
                    stepResults=[sr.__dict__ for sr in ctx.step_results],
                )
            last_ctx = ctx

        # exhausted attempts
        detail = "filters could not be satisfied within MAX_ATTEMPTS"
        if last_ctx is not None and len(last_ctx.selected) != 6:
            detail = "pipeline did not yield 6 numbers (check block counts)"
        raise FilterUnsatisfiableError(detail)
