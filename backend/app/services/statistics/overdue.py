from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories import lotto_repo
from app.schemas.statistics import OverdueItem, OverdueResponse
from app.utils.lotto_rules import LOTTO_RANGE


def overdue(db: Session) -> OverdueResponse:
    draws = lotto_repo.all_draws(db)  # ascending by draw_no
    total = len(draws)
    if total == 0:
        return OverdueResponse(latest_draw_no=0, total_draws=0, items=[])

    # Index of the most recent draw each number appeared in.
    last_idx: dict[int, int] = {}
    for idx, d in enumerate(draws):
        for n in d.numbers:
            last_idx[n] = idx

    latest_draw_no = draws[-1].draw_no
    items: list[OverdueItem] = []
    for num in LOTTO_RANGE:
        if num in last_idx:
            idx = last_idx[num]
            items.append(
                OverdueItem(
                    number=num,
                    last_draw_no=draws[idx].draw_no,
                    gap=(total - 1) - idx,
                )
            )
        else:
            items.append(OverdueItem(number=num, last_draw_no=None, gap=total))

    items.sort(key=lambda it: (-it.gap, it.number))
    return OverdueResponse(
        latest_draw_no=latest_draw_no, total_draws=total, items=items
    )
