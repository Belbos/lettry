from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories import lotto_repo
from app.schemas.statistics import StatisticsSummary, SumDistributionBucket
from app.utils.lotto_rules import LOW_HIGH_BOUNDARY


def summary(db: Session) -> StatisticsSummary:
    draws = lotto_repo.all_draws(db)
    total = len(draws)
    if total == 0:
        return StatisticsSummary(
            total_draws=0,
            odd_even_avg=(0.0, 0.0),
            low_high_avg=(0.0, 0.0),
            sum_min=0, sum_max=0, sum_avg=0.0,
            sum_distribution=[],
            consecutive_pair_avg=0.0,
        )

    odd_total = even_total = 0
    low_total = high_total = 0
    sums: list[int] = []
    consec_total = 0

    for d in draws:
        nums = sorted(d.numbers)
        odd = sum(1 for n in nums if n % 2 == 1)
        odd_total += odd
        even_total += 6 - odd
        low = sum(1 for n in nums if n <= LOW_HIGH_BOUNDARY)
        low_total += low
        high_total += 6 - low
        sums.append(sum(nums))
        consec_total += sum(1 for i in range(5) if nums[i + 1] - nums[i] == 1)

    # 20-wide buckets covering 21..255
    buckets: dict[str, int] = {}
    for s in sums:
        lo = (s // 20) * 20
        key = f"{lo}-{lo + 19}"
        buckets[key] = buckets.get(key, 0) + 1
    dist = [SumDistributionBucket(bucket=k, count=v)
            for k, v in sorted(buckets.items(), key=lambda kv: int(kv[0].split('-')[0]))]

    return StatisticsSummary(
        total_draws=total,
        odd_even_avg=(odd_total / total, even_total / total),
        low_high_avg=(low_total / total, high_total / total),
        sum_min=min(sums), sum_max=max(sums), sum_avg=sum(sums) / total,
        sum_distribution=dist,
        consecutive_pair_avg=consec_total / total,
    )
