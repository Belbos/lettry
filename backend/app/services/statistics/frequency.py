from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories import lotto_repo
from app.schemas.statistics import (
    NumberFrequencyItem,
    NumberFrequencyResponse,
    StatRange,
)
from app.services.statistics.snapshot import _count_numbers


_RANGE_TO_N: dict[StatRange, int | None] = {
    "all": None, "last_20": 20, "last_50": 50, "last_100": 100,
}


def number_frequency(db: Session, range_: StatRange) -> NumberFrequencyResponse:
    n = _RANGE_TO_N[range_]
    draws = lotto_repo.all_draws(db) if n is None else lotto_repo.latest_n(db, n)
    counts = _count_numbers(draws)
    items = [NumberFrequencyItem(number=k, count=v) for k, v in sorted(counts.items())]
    return NumberFrequencyResponse(range=range_, total_draws=len(draws), items=items)
