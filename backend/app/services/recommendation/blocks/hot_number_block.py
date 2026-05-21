from __future__ import annotations

from app.services.recommendation.blocks.base import RecommendationBlock
from app.services.recommendation.context import RecommendationContext, StepResultLog


class HotNumberBlock(RecommendationBlock):
    type = "hot"

    def execute(self, ctx: RecommendationContext) -> RecommendationContext:
        want = self._capped(int(self.config.get("count", 0)), ctx)
        recent = int(self.config.get("recentRounds", 20))
        if want <= 0:
            ctx.step_results.append(StepResultLog(self.type, [], "skipped (count=0)"))
            return ctx

        freq = ctx.statistics.frequency(recent)
        # Sort by count DESC then by number ASC for determinism.
        ordered = sorted(freq.items(), key=lambda kv: (-kv[1], kv[0]))
        candidates = [n for n, _ in ordered if n not in ctx.excluded]

        # Sample within top-K pool to add a little jitter; K = max(want*3, want).
        k = max(want * 3, want)
        top_pool = candidates[:k]
        picks = ctx.rng.sample(top_pool, want) if len(top_pool) >= want else top_pool[:want]

        for n in picks:
            ctx.pick(n)
        ctx.step_results.append(StepResultLog(self.type, sorted(picks),
                                              f"recentRounds={recent}, want={want}"))
        return ctx
