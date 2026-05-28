import { apiFetch } from "./client";
import type { HistoryCreate, HistoryEntry } from "@/lib/types/history";

export async function listHistory(): Promise<HistoryEntry[]> {
  return apiFetch<HistoryEntry[]>("/api/history");
}

export async function createHistory(
  entry: HistoryCreate,
): Promise<HistoryEntry> {
  return apiFetch<HistoryEntry>("/api/history", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function clearHistory(): Promise<void> {
  await apiFetch<void>("/api/history", { method: "DELETE" });
}
