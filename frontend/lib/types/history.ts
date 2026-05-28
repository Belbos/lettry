import type { RecommendResponse } from "@/lib/types/recommendation";

export type HistoryEntry = {
  id: number;
  numbers: number[];
  summary: RecommendResponse["summary"];
  appliedSteps: string[];
  presetName: string | null;
  createdAt: string;
};

export type HistoryCreate = {
  numbers: number[];
  summary: RecommendResponse["summary"];
  appliedSteps: string[];
  presetName: string | null;
};
