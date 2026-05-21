import { apiFetch } from "./client";
import type { RecommendRequest, RecommendResponse } from "@/lib/types/recommendation";

export function postRecommend(req: RecommendRequest): Promise<RecommendResponse> {
  return apiFetch<RecommendResponse>("/api/recommend", {
    method: "POST",
    body: JSON.stringify(req),
  });
}
