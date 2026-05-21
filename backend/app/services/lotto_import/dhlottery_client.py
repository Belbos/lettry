"""HTTP client for the 동행복권 (Dong-Haeng Lottery) public JSON endpoint.

Endpoint:
    GET https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={N}

Sample success response (round 1224):
    {
      "returnValue": "success",
      "drwNo": 1224, "drwNoDate": "2026-05-16",
      "drwtNo1": 9, "drwtNo2": 18, "drwtNo3": 21,
      "drwtNo4": 27, "drwtNo5": 44, "drwtNo6": 45,
      "bnusNo": 28,
      ... (prize amounts omitted)
    }

Sample failure response (round not yet drawn):
    {"returnValue": "fail"}
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Protocol

import httpx

ENDPOINT = "https://www.dhlottery.co.kr/common.do"
DEFAULT_TIMEOUT = 10.0


@dataclass(frozen=True)
class DhDraw:
    draw_no: int
    draw_date: date
    numbers: tuple[int, int, int, int, int, int]
    bonus: int

    def to_row(self) -> dict:
        ns = sorted(self.numbers)
        return {
            "draw_no":      self.draw_no,
            "draw_date":    self.draw_date,
            "number_1":     ns[0], "number_2": ns[1], "number_3": ns[2],
            "number_4":     ns[3], "number_5": ns[4], "number_6": ns[5],
            "bonus_number": self.bonus,
        }


class DhLotteryError(RuntimeError):
    """Raised on transport or response-shape errors (not on 'not-yet-drawn')."""


class DrawFetcher(Protocol):
    """Protocol so the sync service can inject a fake fetcher in tests."""
    def fetch(self, draw_no: int) -> DhDraw | None: ...


def parse_response(payload: dict) -> DhDraw | None:
    """Return a parsed draw, or None if `returnValue` is not 'success'."""
    if payload.get("returnValue") != "success":
        return None
    try:
        nums = tuple(int(payload[f"drwtNo{i}"]) for i in range(1, 7))
        if any(n < 1 or n > 45 for n in nums) or len(set(nums)) != 6:
            raise DhLotteryError(f"invalid numbers in response: {nums}")
        bonus = int(payload["bnusNo"])
        if not (1 <= bonus <= 45):
            raise DhLotteryError(f"invalid bonus in response: {bonus}")
        return DhDraw(
            draw_no=int(payload["drwNo"]),
            draw_date=datetime.strptime(payload["drwNoDate"], "%Y-%m-%d").date(),
            numbers=nums,  # type: ignore[arg-type]
            bonus=bonus,
        )
    except (KeyError, ValueError, TypeError) as e:
        raise DhLotteryError(f"could not parse response: {e}; payload={payload!r}") from e


class DhLotteryClient:
    """Live HTTP fetcher. Implements the DrawFetcher protocol."""

    def __init__(self, timeout: float = DEFAULT_TIMEOUT, client: httpx.Client | None = None):
        # dhlottery's common.do redirects bot-shaped requests to the homepage.
        # Using a browser-like User-Agent and following redirects keeps the API working.
        self._client = client or httpx.Client(
            timeout=timeout,
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
            },
        )
        self._owns_client = client is None

    def close(self) -> None:
        if self._owns_client:
            self._client.close()

    def __enter__(self) -> "DhLotteryClient":
        return self

    def __exit__(self, *_exc) -> None:
        self.close()

    def fetch(self, draw_no: int) -> DhDraw | None:
        try:
            r = self._client.get(
                ENDPOINT,
                params={"method": "getLottoNumber", "drwNo": draw_no},
            )
            r.raise_for_status()
            payload = r.json()
        except httpx.HTTPError as e:
            raise DhLotteryError(f"HTTP error fetching draw {draw_no}: {e}") from e
        except ValueError as e:
            raise DhLotteryError(f"non-JSON response for draw {draw_no}: {e}") from e
        return parse_response(payload)
