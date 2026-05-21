export type HotStep = {
  type: "hot";
  recentRounds: number;
  count: number;
};

export type ColdStep = {
  type: "cold";
  recentRounds: number;
  count: number;
};

export type WeightRange = {
  from: number;
  to: number;
  weight: number;
};

export type WeightedRandomStep = {
  type: "weighted_random";
  count: number;
  weights: WeightRange[];
};

export type RandomStep = {
  type: "random";
  count: number;
};

export type Step = HotStep | ColdStep | WeightedRandomStep | RandomStep;

export type RecommendFilters = {
  oddEvenRatio?: [number, number];
  lowHighRatio?: [number, number];
  sumRange?: [number, number];
  allowConsecutive?: boolean;
  maxSameLastDigit?: number;
  excludePastWinningCombination?: boolean;
};

export type RecommendRequest = {
  steps: Step[];
  filters?: RecommendFilters;
  seed?: number;
};

export type RecommendSummary = {
  oddCount: number;
  evenCount: number;
  lowCount: number;
  highCount: number;
  sum: number;
  consecutivePairs: number;
};

export type StepResult = {
  type: string;
  pickedNumbers: number[];
  note?: string | null;
};

export type RecommendResponse = {
  numbers: number[];
  summary: RecommendSummary;
  appliedSteps: string[];
  stepResults: StepResult[];
  disclaimer: string;
};
