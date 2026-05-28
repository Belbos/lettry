export type StatRange = "all" | "last_20" | "last_50" | "last_100";

export type NumberFrequencyItem = { number: number; count: number };
export type NumberFrequencyResponse = {
  range: StatRange;
  total_draws: number;
  items: NumberFrequencyItem[];
};

export type HotColdItem = { number: number; count: number; rank: number };
export type HotColdResponse = { range: StatRange; items: HotColdItem[] };

export type SumDistributionBucket = { bucket: string; count: number };
export type StatisticsSummary = {
  total_draws: number;
  odd_even_avg: [number, number];
  low_high_avg: [number, number];
  sum_min: number;
  sum_max: number;
  sum_avg: number;
  sum_distribution: SumDistributionBucket[];
  consecutive_pair_avg: number;
};

export type OverdueItem = {
  number: number;
  last_draw_no: number | null;
  gap: number;
};
export type OverdueResponse = {
  latest_draw_no: number;
  total_draws: number;
  items: OverdueItem[];
};

export type PairItem = { a: number; b: number; count: number };
export type PairResponse = {
  range: StatRange;
  total_draws: number;
  items: PairItem[];
};
