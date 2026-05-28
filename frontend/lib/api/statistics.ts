import { apiFetch } from "./client";
import type {
  HotColdResponse,
  NumberFrequencyResponse,
  OverdueResponse,
  PairResponse,
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

export function getOverdue(): Promise<OverdueResponse> {
  return apiFetch(`/api/statistics/overdue`);
}

export function getPairs(range: StatRange, limit = 15): Promise<PairResponse> {
  return apiFetch(`/api/statistics/pairs?range=${range}&limit=${limit}`);
}
