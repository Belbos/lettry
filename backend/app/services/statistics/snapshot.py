"""Snapshot data structures shared by statistics endpoints and the recommendation engine.

A StatisticsSnapshot is a read-only view of draw history aggregated by various ranges.
Building it once per request avoids repeated DB scans by individual blocks.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.models.lotto_draw import LottoDraw
from app.repositories import lotto_repo
from app.utils.lotto_rules import LOTTO_MAX, LOTTO_MIN


def _empty_counter() -> dict[int, int]:
    return {n: 0 for n in range(LOTTO_MIN, LOTTO_MAX + 1)}


def _count_numbers(draws: list[LottoDraw]) -> dict[int, int]:
    c = _empty_counter()
    for d in draws:
        for n in d.numbers:
            c[n] += 1
    return c


@dataclass
class StatisticsSnapshot:
    total_draws: int
    frequency_all: dict[int, int]
    frequency_by_range: dict[int, dict[int, int]]   # range_n -> {number: count}
    past_winning_sets: set[frozenset]

    def frequency(self, recent_rounds: int | None) -> dict[int, int]:
        if not recent_rounds:
            return self.frequency_all
        return self.frequency_by_range.get(recent_rounds) or self._compute_on_demand(recent_rounds)

    def _compute_on_demand(self, recent_rounds: int) -> dict[int, int]:
        # Should not happen if range was pre-registered; fall back gracefully.
        return self.frequency_all


@dataclass
class StatisticsSnapshotBuilder:
    db: Session
    ranges: list[int] = field(default_factory=lambda: [20, 50, 100])

    def build(self, include_past_sets: bool = True) -> StatisticsSnapshot:
        all_draws = lotto_repo.all_draws(self.db)
        total = len(all_draws)
        freq_all = _count_numbers(all_draws)

        # latest_n style by slicing from the tail (all_draws is ASC by draw_no)
        freq_by_range: dict[int, dict[int, int]] = {}
        for n in self.ranges:
            if total <= n:
                freq_by_range[n] = freq_all
            else:
                freq_by_range[n] = _count_numbers(all_draws[-n:])

        past_sets: set[frozenset] = set()
        if include_past_sets:
            past_sets = {frozenset(d.numbers) for d in all_draws}

        return StatisticsSnapshot(
            total_draws=total,
            frequency_all=freq_all,
            frequency_by_range=freq_by_range,
            past_winning_sets=past_sets,
        )
