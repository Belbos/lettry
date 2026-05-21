"""CSV importer for lotto_draws.

Supports two CSV shapes:

(A) English headers (preferred):
    draw_no, draw_date, n1, n2, n3, n4, n5, n6, bonus

(B) Korean dhlottery export (no draw_date column):
    회차, 번호1, 번호2, 번호3, 번호4, 번호5, 번호6, 보너스, [extra…]
    Draw date is derived from draw_no using LOTTO_FIRST_DRAW_DATE + (draw_no-1)*7 days.

File encoding is auto-detected (utf-8 → cp949 → euc-kr fallback).
"""
from __future__ import annotations

from datetime import date, timedelta
from io import BytesIO
from typing import IO

import pandas as pd
from sqlalchemy.orm import Session

from app.repositories.lotto_repo import bulk_insert
from app.utils.lotto_rules import LOTTO_MAX, LOTTO_MIN

# Round 1 of Korean Lotto 6/45 was drawn on 2002-12-07 (Saturday).
LOTTO_FIRST_DRAW_DATE = date(2002, 12, 7)

KOREAN_TO_ENGLISH = {
    "회차": "draw_no",
    "번호1": "n1", "번호2": "n2", "번호3": "n3",
    "번호4": "n4", "번호5": "n5", "번호6": "n6",
    "보너스": "bonus",
}

ENGLISH_REQUIRED_NO_DATE = {"draw_no", "n1", "n2", "n3", "n4", "n5", "n6", "bonus"}


def _read_csv_any_encoding(source: str | IO[bytes]) -> pd.DataFrame:
    if isinstance(source, str):
        with open(source, "rb") as f:
            raw = f.read()
    else:
        raw = source.read()

    for enc in ("utf-8", "utf-8-sig", "cp949", "euc-kr"):
        try:
            return pd.read_csv(BytesIO(raw), encoding=enc)
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue
    raise ValueError("could not decode CSV with utf-8, cp949, or euc-kr")


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.rename(columns=lambda c: c.strip())
    df = df.rename(columns=KOREAN_TO_ENGLISH)
    return df


def _derive_date(draw_no: int) -> date:
    return LOTTO_FIRST_DRAW_DATE + timedelta(weeks=draw_no - 1)


def import_csv(db: Session, source: str | IO[bytes]) -> int:
    df = _read_csv_any_encoding(source)
    df = _normalize_columns(df)

    missing = ENGLISH_REQUIRED_NO_DATE - set(df.columns)
    if missing:
        raise ValueError(
            f"CSV missing columns: {sorted(missing)} "
            f"(found: {sorted(df.columns.tolist())})"
        )

    has_date_column = "draw_date" in df.columns

    rows: list[dict] = []
    for _, r in df.iterrows():
        try:
            draw_no = int(r["draw_no"])
        except (ValueError, TypeError):
            continue  # skip malformed/empty rows

        nums = sorted(int(r[f"n{i}"]) for i in range(1, 7))
        if any(n < LOTTO_MIN or n > LOTTO_MAX for n in nums):
            raise ValueError(f"draw_no={draw_no} has out-of-range number: {nums}")
        if len(set(nums)) != 6:
            raise ValueError(f"draw_no={draw_no} contains duplicates: {nums}")
        bonus = int(r["bonus"])
        if not (LOTTO_MIN <= bonus <= LOTTO_MAX):
            raise ValueError(f"draw_no={draw_no} bonus out of range: {bonus}")

        if has_date_column and pd.notna(r["draw_date"]):
            draw_date = pd.to_datetime(r["draw_date"]).date()
        else:
            draw_date = _derive_date(draw_no)

        rows.append({
            "draw_no":      draw_no,
            "draw_date":    draw_date,
            "number_1":     nums[0], "number_2": nums[1], "number_3": nums[2],
            "number_4":     nums[3], "number_5": nums[4], "number_6": nums[5],
            "bonus_number": bonus,
        })
    return bulk_insert(db, rows)
