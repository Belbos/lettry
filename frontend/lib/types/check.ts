export type DrawMatch = {
  drawNo: number;
  drawDate: string;
  matchCount: number;
  bonusMatch: boolean;
  rank: number | null;
};

export type CheckResponse = {
  numbers: number[];
  totalDraws: number;
  rankCounts: Record<string, number>;
  best: DrawMatch | null;
  target: DrawMatch | null;
};
