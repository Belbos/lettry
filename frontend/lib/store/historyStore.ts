"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecommendResponse } from "@/lib/types/recommendation";

export type HistoryEntry = {
  id: string;
  numbers: number[];
  summary: RecommendResponse["summary"];
  appliedSteps: string[];
  presetName: string | null;
  createdAt: string;
};

type HistoryState = {
  entries: HistoryEntry[];
  push: (entry: Omit<HistoryEntry, "id" | "createdAt">) => void;
  clear: () => void;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const MAX_ENTRIES = 100;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      push: (entry) => {
        const e: HistoryEntry = {
          ...entry,
          id: uid(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ entries: [e, ...s.entries].slice(0, MAX_ENTRIES) }));
      },
      clear: () => set({ entries: [] }),
    }),
    { name: "lottery-history-v1" },
  ),
);
