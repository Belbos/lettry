"use client";

import { create } from "zustand";
import {
  clearHistory,
  createHistory,
  listHistory,
} from "@/lib/api/history";
import type { HistoryCreate, HistoryEntry } from "@/lib/types/history";

export type { HistoryEntry } from "@/lib/types/history";

type HistoryState = {
  entries: HistoryEntry[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  push: (entry: HistoryCreate) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
};

export const useHistoryStore = create<HistoryState>()((set) => ({
  entries: [],
  loading: false,
  loaded: false,
  load: async () => {
    set({ loading: true });
    try {
      const entries = await listHistory();
      set({ entries, loaded: true });
    } finally {
      set({ loading: false });
    }
  },
  push: async (entry) => {
    const created = await createHistory(entry);
    set((s) => ({ entries: [created, ...s.entries] }));
  },
  clear: async () => {
    await clearHistory();
    set({ entries: [] });
  },
  reset: () => set({ entries: [], loaded: false }),
}));
