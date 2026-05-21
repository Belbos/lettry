import { apiFetch } from "./client";
import type {
  HotColdResponse,
  NumberFrequencyResponse,
  StatRange,
  StatisticsSummary,
} from "@/lib/types/statistics";

export function getFrequency(range: StatRange): Promise<NumberFrequencyResponse> {
  return apiFetch(`/api/statistics/number-frequency?range=${range}`);
}

export function getHot(range: StatRange, limit = 6): Promise<HotColdResponse> {
  return apiFetch(`/api/statistics/hot?range=${range}&limit=${limit}`);
}

export function getCold(range: StatRange, limit = 6): Promise<HotColdResponse> {
  return apiFetch(`/api/statistics/cold?range=${range}&limit=${limit}`);
}

export function getSummary(): Promise<StatisticsSummary> {
  return apiFetch(`/api/statistics/summary`);
}
