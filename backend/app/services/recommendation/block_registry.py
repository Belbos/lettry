"""Map step `type` strings to block classes.

Extension point: when a new algorithm (e.g. an AI block) is added, just
register it here — the engine consumes whatever is in the registry.
"""
from __future__ import annotations

from app.services.recommendation.blocks.base import RecommendationBlock
from app.services.recommendation.blocks.cold_number_block import ColdNumberBlock
from app.services.recommendation.blocks.filter_validation_block import FilterValidationBlock
from app.services.recommendation.blocks.hot_number_block import HotNumberBlock
from app.services.recommendation.blocks.pure_random_block import PureRandomBlock
from app.services.recommendation.blocks.weighted_random_block import WeightedRandomBlock

BLOCK_REGISTRY: dict[str, type[RecommendationBlock]] = {
    HotNumberBlock.type: HotNumberBlock,
    ColdNumberBlock.type: ColdNumberBlock,
    WeightedRandomBlock.type: WeightedRandomBlock,
    PureRandomBlock.type: PureRandomBlock,
    FilterValidationBlock.type: FilterValidationBlock,
}


def build_block(step_config: dict) -> RecommendationBlock:
    t = step_config.get("type")
    if t not in BLOCK_REGISTRY:
        raise ValueError(f"unknown block type: {t!r}")
    return BLOCK_REGISTRY[t](step_config)
