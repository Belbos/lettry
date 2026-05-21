from __future__ import annotations

from app.services.recommendation.blocks.base import RecommendationBlock
from app.services.recommendation.context import RecommendationContext, StepResultLog


class FilterValidationBlock(RecommendationBlock):
    """Marker block — actual validation is performed by the engine.

    Inserting this into the pipeline simply records the inspection step in
    `appliedSteps` and `step_results` for transparency in the UI.
    """
    type = "filter_validation"

    def execute(self, ctx: RecommendationContext) -> RecommendationContext:
        ctx.step_results.append(StepResultLog(
            self.type,
            sorted(ctx.selected),
            f"validation deferred to engine; current={sorted(ctx.selected)}",
        ))
        return ctx
