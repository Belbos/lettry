"""Incremental sync of new lotto draws from 동행복권 into the local DB.

Strategy:
    1. Read max(draw_no) from DB.
    2. Fetch draw_no = max+1, max+2, ... via the injected fetcher.
    3. Stop on the first fetcher response of None (not yet drawn) or on `max_fetch` cap.
    4. bulk_insert the new rows.

The fetcher is injected so unit tests can stub it out without hitting the network.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.lotto_draw import LottoDraw
from app.repositories.lotto_repo import bulk_insert
from app.services.lotto_import.dhlottery_client import DhLotteryClient, DrawFetcher

logger = logging.getLogger(__name__)


@dataclass
class SyncResult:
    inserted: int = 0
    fetched: int = 0
    started_from: int = 0
    stopped_at: int = 0
    new_draw_nos: list[int] = field(default_factory=list)
    note: str = ""


DEFAULT_MAX_FETCH = 20    # safety cap per run
DEFAULT_DELAY = 0.4       # seconds between requests; polite for shared infra


def latest_draw_no(db: Session) -> int:
    """Return the highest draw_no in DB, or 0 if empty."""
    return db.scalar(select(func.coalesce(func.max(LottoDraw.draw_no), 0))) or 0


def sync_new_draws(
    db: Session,
    fetcher: DrawFetcher | None = None,
    max_fetch: int = DEFAULT_MAX_FETCH,
    delay: float = DEFAULT_DELAY,
) -> SyncResult:
    """Fetch any newly-drawn rounds since the latest one in DB.

    Args:
        db: SQLAlchemy session.
        fetcher: A DrawFetcher; defaults to a live DhLotteryClient.
        max_fetch: Hard cap on the number of fetches per call.
        delay: Seconds to sleep between consecutive fetches.
    """
    own_client = fetcher is None
    client_ctx: DhLotteryClient | None = None
    if own_client:
        client_ctx = DhLotteryClient()
        fetcher = client_ctx

    try:
        start = latest_draw_no(db) + 1
        result = SyncResult(started_from=start, stopped_at=start - 1)
        new_rows: list[dict] = []

        for offset in range(max_fetch):
            draw_no = start + offset
            draw = fetcher.fetch(draw_no)
            result.fetched += 1
            if draw is None:
                result.note = f"draw_no={draw_no} not yet available; stopping"
                break
            new_rows.append(draw.to_row())
            result.new_draw_nos.append(draw.draw_no)
            result.stopped_at = draw_no
            if delay and offset < max_fetch - 1:
                time.sleep(delay)
        else:
            result.note = f"reached max_fetch={max_fetch}; rerun to continue"

        if new_rows:
            result.inserted = bulk_insert(db, new_rows)
        return result
    finally:
        if client_ctx is not None:
            client_ctx.close()
