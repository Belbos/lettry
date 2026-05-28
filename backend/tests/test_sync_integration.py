"""End-to-end integration test for /api/lotto/sync with a mocked dhlottery fetcher.

Proves the entire pipeline works against the real FastAPI app + SQLAlchemy DB,
without requiring network access to the upstream API.
"""
from __future__ import annotations

from datetime import date
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.dependencies.auth import get_current_user
from app.main import app
from app.models import LottoDraw  # noqa: F401
from app.models.user import User
from app.services.lotto_import.dhlottery_client import DhDraw


@pytest.fixture()
def client():
    # Use a fresh in-memory DB per test, wired into FastAPI via dependency override.
    # StaticPool keeps a single shared connection so :memory: stays consistent
    # across the multiple requests TestClient issues for one test.
    engine = create_engine(
        "sqlite:///:memory:", future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def _get_db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_db
    app.dependency_overrides[get_current_user] = lambda: User(
        id=1, username="tester", email="tester@e.com", hashed_password="x"
    )
    yield TestClient(app)
    app.dependency_overrides.clear()


class FakeClient:
    """Mimics DhLotteryClient as a context manager + DrawFetcher."""
    def __init__(self, available: dict[int, DhDraw]):
        self.available = available
    def __enter__(self): return self
    def __exit__(self, *_): pass
    def close(self): pass
    def fetch(self, draw_no: int): return self.available.get(draw_no)


def _draw(no: int, nums=(1, 2, 3, 4, 5, 6), bonus=7) -> DhDraw:
    return DhDraw(draw_no=no, draw_date=date(2026, 1, 1), numbers=nums, bonus=bonus)


def test_sync_endpoint_picks_up_new_draws(client):
    # Seed DB with one existing draw via CSV import.
    csv_bytes = (
        "draw_no,draw_date,n1,n2,n3,n4,n5,n6,bonus\n"
        "1,2002-12-07,10,23,29,33,37,40,16\n"
    ).encode()
    r = client.post(
        "/api/lotto/import-csv",
        files={"file": ("seed.csv", csv_bytes, "text/csv")},
    )
    assert r.status_code == 200, r.text
    assert r.json()["total"] == 1

    # Pretend the upstream API has rounds 2, 3, 4 available; 5 is not yet drawn.
    fake = FakeClient({
        2: _draw(2, (1, 8, 15, 22, 29, 36), bonus=42),
        3: _draw(3, (3, 11, 18, 25, 32, 39), bonus=44),
        4: _draw(4, (5, 12, 19, 26, 33, 40), bonus=45),
    })

    with patch(
        "app.services.lotto_import.dhlottery_sync.DhLotteryClient",
        return_value=fake,
    ):
        r = client.post("/api/lotto/sync?max_fetch=10")

    assert r.status_code == 200, r.text
    body = r.json()
    assert body["inserted"] == 3
    assert body["new_draw_nos"] == [2, 3, 4]
    assert body["started_from"] == 2
    assert body["stopped_at"] == 4
    assert body["total"] == 4
    assert "not yet available" in body["note"]


def test_sync_endpoint_idempotent_when_no_new_data(client):
    csv_bytes = (
        "draw_no,draw_date,n1,n2,n3,n4,n5,n6,bonus\n"
        "1,2002-12-07,10,23,29,33,37,40,16\n"
    ).encode()
    client.post(
        "/api/lotto/import-csv",
        files={"file": ("seed.csv", csv_bytes, "text/csv")},
    )

    # Upstream has nothing new.
    fake = FakeClient({})
    with patch(
        "app.services.lotto_import.dhlottery_sync.DhLotteryClient",
        return_value=fake,
    ):
        r = client.post("/api/lotto/sync")
        assert r.status_code == 200
        assert r.json()["inserted"] == 0
        # Running again is safe and still inserts nothing.
        r2 = client.post("/api/lotto/sync")
        assert r2.json()["inserted"] == 0
