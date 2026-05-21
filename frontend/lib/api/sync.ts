import { apiFetch } from "./client";
import type { SyncResponse } from "@/lib/types/sync";

export function postSync(maxFetch = 20): Promise<SyncResponse> {
  return apiFetch(`/api/lotto/sync?max_fetch=${maxFetch}`, { method: "POST" });
}
