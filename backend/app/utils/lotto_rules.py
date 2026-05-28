LOTTO_MIN = 1
LOTTO_MAX = 45
LOTTO_PICK = 6
LOW_HIGH_BOUNDARY = 22  # 1..22 = low, 23..45 = high
LOTTO_RANGE = range(LOTTO_MIN, LOTTO_MAX + 1)


def rank_for(match_count: int, bonus_match: bool) -> int | None:
    """Korean lotto prize tier. Returns 1..5, or None for no prize."""
    if match_count == 6:
        return 1
    if match_count == 5 and bonus_match:
        return 2
    if match_count == 5:
        return 3
    if match_count == 4:
        return 4
    if match_count == 3:
        return 5
    return None
