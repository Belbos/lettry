import { apiFetch } from "./client";
import type { DrawListResponse } from "@/lib/types/draw";

export function listDraws(
  limit: number,
  offset: number,
): Promise<DrawListResponse> {
  return apiFetch(`/api/lotto/draws?limit=${limit}&offset=${offset}`);
}
