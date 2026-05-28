from __future__ import annotations

from itertools import combinations

from sqlalchemy.orm import Session

from app.repositories import lotto_repo
from app.schemas.statistics import PairItem, PairResponse, StatRange

_RANGE_TO_N: dict[StatRange, int | None] = {
    "all": None, "last_20": 20, "last_50": 50, "last_100": 100,
}


def top_pairs(db: Session, range_: StatRange, limit: int) -> PairResponse:
    n = _RANGE_TO_N[range_]
    draws = lotto_repo.all_draws(db) if n is None else lotto_repo.latest_n(db, n)

    counts: dict[tuple[int, int], int] = {}
    for d in draws:
        for a, b in combinations(sorted(d.numbers), 2):
            counts[(a, b)] = counts.get((a, b), 0) + 1

    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:limit]
    items = [PairItem(a=a, b=b, count=c) for (a, b), c in ranked]
    return PairResponse(range=range_, total_draws=len(draws), items=items)
