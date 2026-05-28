"""CLI to grant/revoke admin rights for an existing user (admin bootstrap).

Usage (from backend/):
    python -m scripts.create_admin <username>            # promote to admin
    python -m scripts.create_admin <username> --revoke   # revoke admin

Runs out-of-band against the DB (no network exposure). The username is
normalized to lowercase to match the registration rule.
"""
from __future__ import annotations

import argparse
import sys

from sqlalchemy import select

from app.database import SessionLocal
from app.models.user import User


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("username", help="target user's login id")
    p.add_argument("--revoke", action="store_true", help="revoke admin instead of granting")
    args = p.parse_args(argv)

    username = args.username.strip().lower()
    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.username == username))
        if user is None:
            print(f"error: user '{username}' not found. Register the account first.")
            return 1
        user.is_admin = not args.revoke
        db.commit()
        state = "revoked" if args.revoke else "granted"
        print(f"✓ admin {state} for '{username}' (id={user.id})")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
