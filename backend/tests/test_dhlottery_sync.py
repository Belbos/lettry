"""Unit tests for the dhlottery sync pipeline (no network)."""
from __future__ import annotations

from datetime import date

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import LottoDraw  # noqa: F401 — register table
from app.services.lotto_import.dhlottery_client import (
    DhDraw,
    DhLotteryError,
    DrawFetcher,
    parse_response,
)
from app.services.lotto_import.dhlottery_sync import (
    SyncResult,
    latest_draw_no,
    sync_new_draws,
)


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = Session()
    try:
        yield session
    finally:
        session.close()


class FakeFetcher:
    """Returns the configured list of draws by draw_no; unknown draw_nos return None."""
    def __init__(self, draws: list[DhDraw]):
        self._by_no = {d.draw_no: d for d in draws}
        self.calls: list[int] = []

    def fetch(self, draw_no: int) -> DhDraw | None:
        self.calls.append(draw_no)
        return self._by_no.get(draw_no)


def _make_draw(no: int) -> DhDraw:
    return DhDraw(
        draw_no=no,
        draw_date=date(2026, 1, 1),
        numbers=(1, 2, 3, 4, 5, 6),
        bonus=7,
    )


# ---------- parse_response ----------

def test_parse_success():
    payload = {
        "returnValue": "success",
        "drwNo": 1224, "drwNoDate": "2026-05-16",
        "drwtNo1": 9, "drwtNo2": 18, "drwtNo3": 21,
        "drwtNo4": 27, "drwtNo5": 44, "drwtNo6": 45,
        "bnusNo": 28,
    }
    d = parse_response(payload)
    assert d is not None
    assert d.draw_no == 1224
    assert d.draw_date == date(2026, 5, 16)
    assert d.numbers == (9, 18, 21, 27, 44, 45)
    assert d.bonus == 28


def test_parse_fail_returns_none():
    assert parse_response({"returnValue": "fail"}) is None


def test_parse_malformed_raises():
    with pytest.raises(DhLotteryError):
        parse_response({"returnValue": "success", "drwNo": 1})


def test_parse_invalid_numbers_raises():
    payload = {
        "returnValue": "success",
        "drwNo": 1, "drwNoDate": "2026-01-01",
        "drwtNo1": 99, "drwtNo2": 2, "drwtNo3": 3,
        "drwtNo4": 4, "drwtNo5": 5, "drwtNo6": 6,
        "bnusNo": 7,
    }
    with pytest.raises(DhLotteryError):
        parse_response(payload)


# ---------- sync_new_draws ----------

def test_latest_draw_no_empty(db):
    assert latest_draw_no(db) == 0


def test_sync_inserts_new_draws_from_scratch(db):
    fetcher = FakeFetcher([_make_draw(1), _make_draw(2), _make_draw(3)])
    res = sync_new_draws(db, fetcher=fetcher, delay=0)
    assert res.inserted == 3
    assert res.new_draw_nos == [1, 2, 3]
    assert res.started_from == 1
    assert res.stopped_at == 3
    assert latest_draw_no(db) == 3
    # First call after last success returned None → 4 total calls.
    assert fetcher.calls == [1, 2, 3, 4]


def test_sync_is_incremental(db):
    # Pre-populate DB with draws 1..5
    fetcher = FakeFetcher([_make_draw(n) for n in range(1, 6)])
    sync_new_draws(db, fetcher=fetcher, delay=0)

    # Now expose draws 6,7 — sync should fetch only those.
    fetcher2 = FakeFetcher([_make_draw(6), _make_draw(7)])
    res = sync_new_draws(db, fetcher=fetcher2, delay=0)
    assert res.inserted == 2
    assert res.new_draw_nos == [6, 7]
    assert res.started_from == 6
    assert latest_draw_no(db) == 7


def test_sync_idempotent_when_no_new_draws(db):
    fetcher = FakeFetcher([_make_draw(1), _make_draw(2)])
    sync_new_draws(db, fetcher=fetcher, delay=0)

    # No new data available; sync should be a no-op.
    fetcher2 = FakeFetcher([])
    res = sync_new_draws(db, fetcher=fetcher2, delay=0)
    assert res.inserted == 0
    assert res.new_draw_nos == []
    assert res.stopped_at == res.started_from - 1
    assert latest_draw_no(db) == 2


def test_sync_respects_max_fetch_cap(db):
    fetcher = FakeFetcher([_make_draw(n) for n in range(1, 100)])
    res = sync_new_draws(db, fetcher=fetcher, max_fetch=3, delay=0)
    assert res.inserted == 3
    assert res.fetched == 3
    assert "max_fetch" in res.note
