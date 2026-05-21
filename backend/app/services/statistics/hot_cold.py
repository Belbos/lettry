from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories import lotto_repo
from app.schemas.statistics import HotColdItem, HotColdResponse, StatRange
from app.services.statistics.snapshot import _count_numbers

_RANGE_TO_N: dict[StatRange, int | None] = {
    "all": None, "last_20": 20, "last_50": 50, "last_100": 100,
}


def _ranked(counts: dict[int, int], reverse: bool, limit: int) -> list[HotColdItem]:
    # Stable secondary sort by number ascending for determinism.
    ordered = sorted(counts.items(), key=lambda kv: (-kv[1] if reverse else kv[1], kv[0]))
    return [HotColdItem(number=k, count=v, rank=i + 1)
            for i, (k, v) in enumerate(ordered[:limit])]


def hot(db: Session, range_: StatRange, limit: int) -> HotColdResponse:
    n = _RANGE_TO_N[range_]
    draws = lotto_repo.all_draws(db) if n is None else lotto_repo.latest_n(db, n)
    return HotColdResponse(range=range_, items=_ranked(_count_numbers(draws), True, limit))


def cold(db: Session, range_: StatRange, limit: int) -> HotColdResponse:
    n = _RANGE_TO_N[range_]
    draws = lotto_repo.all_draws(db) if n is None else lotto_repo.latest_n(db, n)
    return HotColdResponse(range=range_, items=_ranked(_count_numbers(draws), False, limit))
