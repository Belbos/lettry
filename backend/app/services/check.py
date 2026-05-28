from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.lotto_draw import LottoDraw
from app.repositories import lotto_repo
from app.utils.lotto_rules import rank_for


@dataclass
class DrawMatch:
    draw_no: int
    draw_date: str
    match_count: int
    bonus_match: bool
    rank: int | None


@dataclass
class CheckResult:
    total_draws: int
    rank_counts: dict[int, int]
    best: DrawMatch | None
    target: DrawMatch | None


def _match(candidate: set[int], draw: LottoDraw) -> DrawMatch:
    match_count = len(candidate & set(draw.numbers))
    bonus_match = draw.bonus_number in candidate
    return DrawMatch(
        draw_no=draw.draw_no,
        draw_date=draw.draw_date.isoformat(),
        match_count=match_count,
        bonus_match=bonus_match,
        rank=rank_for(match_count, bonus_match),
    )


def check_numbers(
    db: Session, numbers: list[int], draw_no: int | None = None
) -> CheckResult:
    candidate = set(numbers)
    draws = lotto_repo.all_draws(db)

    rank_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    best: DrawMatch | None = None
    for d in draws:
        m = _match(candidate, d)
        if m.rank is None:
            continue
        rank_counts[m.rank] += 1
        # Best = highest tier (lowest rank number); tie-break on most recent draw.
        if best is None or m.rank < best.rank or (
            m.rank == best.rank and m.draw_no > best.draw_no
        ):
            best = m

    target: DrawMatch | None = None
    if draw_no is not None:
        d = lotto_repo.get_draw(db, draw_no)
        if d is not None:
            target = _match(candidate, d)

    return CheckResult(
        total_draws=len(draws),
        rank_counts=rank_counts,
        best=best,
        target=target,
    )
