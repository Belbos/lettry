from __future__ import annotations

from app.services.recommendation.blocks.base import RecommendationBlock
from app.services.recommendation.context import RecommendationContext, StepResultLog


def _weight_for(n: int, weights: list[dict]) -> float:
    for w in weights:
        lo = w.get("from", w.get("from_"))
        hi = w["to"]
        if lo <= n <= hi:
            return float(w["weight"])
    return 1.0  # unspecified ranges default to 1.0


class WeightedRandomBlock(RecommendationBlock):
    type = "weighted_random"

    def execute(self, ctx: RecommendationContext) -> RecommendationContext:
        want = self._capped(int(self.config.get("count", 0)), ctx)
        weights_cfg: list[dict] = self.config.get("weights", []) or []
        if want <= 0:
            ctx.step_results.append(StepResultLog(self.type, [], "skipped (count=0)"))
            return ctx

        pool = ctx.remaining_pool
        if not pool:
            ctx.step_results.append(StepResultLog(self.type, [], "empty pool"))
            return ctx

        picks: list[int] = []
        local_pool = list(pool)
        local_weights = [_weight_for(n, weights_cfg) for n in local_pool]

        for _ in range(want):
            if not local_pool:
                break
            total = sum(local_weights)
            if total <= 0:
                # fall back to uniform if all weights are zero
                idx = ctx.rng.randrange(len(local_pool))
            else:
                r = ctx.rng.random() * total
                cum = 0.0
                idx = 0
                for i, w in enumerate(local_weights):
                    cum += w
                    if r <= cum:
                        idx = i
                        break
            picked = local_pool.pop(idx)
            local_weights.pop(idx)
            picks.append(picked)
            ctx.pick(picked)

        ctx.step_results.append(StepResultLog(self.type, sorted(picks),
                                              f"weights={len(weights_cfg)} ranges, want={want}"))
        return ctx
