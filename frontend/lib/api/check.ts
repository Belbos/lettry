import { apiFetch } from "./client";
import type { CheckResponse } from "@/lib/types/check";

export async function checkNumbers(
  numbers: number[],
  drawNo?: number,
): Promise<CheckResponse> {
  return apiFetch<CheckResponse>("/api/check", {
    method: "POST",
    body: JSON.stringify({ numbers, draw_no: drawNo ?? null }),
  });
}
