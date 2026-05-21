"""CLI runner for syncing new lotto draws from 동행복권.

Usage (from backend/):
    python -m scripts.sync_dhlottery [--max-fetch N] [--probe]

--probe   Fetch a single known draw (1224) and print the parsed result without
          touching the DB. Useful for verifying connectivity from your network.

This is independent of the FastAPI server; it opens its own DB session.
"""
from __future__ import annotations

import argparse
import logging
import sys

from app.database import Base, SessionLocal, engine
from app.models import LottoDraw  # noqa: F401 — register table
from app.services.lotto_import.dhlottery_client import (
    DhLotteryClient,
    DhLotteryError,
)
from app.services.lotto_import.dhlottery_sync import latest_draw_no, sync_new_draws

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("sync")


def cmd_probe() -> int:
    log.info("probing dhlottery for draw_no=1224 ...")
    try:
        with DhLotteryClient() as c:
            d = c.fetch(1224)
    except DhLotteryError as e:
        log.error("upstream error: %s", e)
        log.error(
            "동행복권 엔드포인트가 자동 요청을 차단하거나 변경된 것 같습니다. "
            "한국 IP에서 실행하거나 CSV import를 사용하세요."
        )
        return 2

    if d is None:
        log.warning("draw 1224 returned returnValue=fail (not yet drawn? unusual)")
        return 3

    log.info("✓ probe OK: %s", d)
    return 0


def cmd_sync(max_fetch: int) -> int:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        log.info("latest draw_no in DB: %d", latest_draw_no(db))
        log.info("starting sync (max_fetch=%d) ...", max_fetch)
        try:
            res = sync_new_draws(db, max_fetch=max_fetch)
        except DhLotteryError as e:
            log.error("sync failed (upstream error): %s", e)
            return 2

        log.info("sync complete:")
        log.info("  inserted : %d", res.inserted)
        log.info("  fetched  : %d", res.fetched)
        log.info("  new draws: %s", res.new_draw_nos or "(none)")
        log.info("  note     : %s", res.note)
        return 0
    finally:
        db.close()


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--max-fetch", type=int, default=20,
        help="max draws to fetch in one run (default 20)",
    )
    p.add_argument(
        "--probe", action="store_true",
        help="fetch a single known draw (1224) to verify connectivity",
    )
    args = p.parse_args(argv)

    if args.probe:
        return cmd_probe()
    return cmd_sync(args.max_fetch)


if __name__ == "__main__":
    sys.exit(main())
