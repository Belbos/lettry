from __future__ import annotations

from app.services.recommendation.blocks.base import RecommendationBlock
from app.services.recommendation.context import RecommendationContext, StepResultLog


class PureRandomBlock(RecommendationBlock):
    type = "random"

    def execute(self, ctx: RecommendationContext) -> RecommendationContext:
        want = self._capped(int(self.config.get("count", 0)), ctx)
        if want <= 0:
            ctx.step_results.append(StepResultLog(self.type, [], "skipped (count=0)"))
            return ctx

        pool = ctx.remaining_pool
        if len(pool) < want:
            want = len(pool)
        picks = ctx.rng.sample(pool, want) if want > 0 else []
        for n in picks:
            ctx.pick(n)
        ctx.step_results.append(StepResultLog(self.type, sorted(picks), f"want={want}"))
        return ctx
