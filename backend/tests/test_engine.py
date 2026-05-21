"""Smoke tests for the recommendation engine — runs without a database."""
from __future__ import annotations

from app.services.recommendation.block_registry import build_block
from app.services.recommendation.engine import RecommendationEngine
from app.services.recommendation.filters.consecutive_filter import ConsecutiveFilter
from app.services.recommendation.filters.low_high_filter import LowHighFilter
from app.services.recommendation.filters.odd_even_filter import OddEvenFilter
from app.services.recommendation.filters.sum_range_filter import SumRangeFilter
from app.services.statistics.snapshot import StatisticsSnapshot


def _fake_snapshot() -> StatisticsSnapshot:
    # uniform frequency over 1..45
    freq = {n: 1 for n in range(1, 46)}
    return StatisticsSnapshot(
        total_draws=100,
        frequency_all=freq,
        frequency_by_range={20: freq, 50: freq, 100: freq},
        past_winning_sets=set(),
    )


def test_engine_produces_6_numbers_in_range():
    steps = [
        {"type": "hot", "recentRounds": 20, "count": 2},
        {"type": "cold", "recentRounds": 20, "count": 1},
        {"type": "weighted_random", "count": 1, "weights": [
            {"from": 1, "to": 10, "weight": 1.2},
            {"from": 11, "to": 20, "weight": 1.0},
            {"from": 21, "to": 30, "weight": 0.9},
            {"from": 31, "to": 45, "weight": 1.1},
        ]},
        {"type": "random", "count": 2},
    ]
    blocks = [build_block(s) for s in steps]
    engine = RecommendationEngine(blocks=blocks, filters=[], statistics=_fake_snapshot())
    result = engine.run(user_config={"steps": steps}, seed=42)

    assert len(result.numbers) == 6
    assert all(1 <= n <= 45 for n in result.numbers)
    assert len(set(result.numbers)) == 6
    assert result.numbers == sorted(result.numbers)


def test_engine_satisfies_filters_when_satisfiable():
    steps = [{"type": "random", "count": 6}]
    blocks = [build_block(s) for s in steps]
    filters = [
        OddEvenFilter(3, 3),
        LowHighFilter(3, 3),
        SumRangeFilter(100, 170),
        ConsecutiveFilter(allow=True),
    ]
    engine = RecommendationEngine(blocks=blocks, filters=filters, statistics=_fake_snapshot())
    result = engine.run(user_config={"steps": steps}, seed=7)
    s = sorted(result.numbers)
    assert sum(1 for n in s if n % 2 == 1) == 3
    assert sum(1 for n in s if n <= 22) == 3
    assert 100 <= sum(s) <= 170
