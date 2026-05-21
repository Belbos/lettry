"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecommendFilters, Step } from "@/lib/types/recommendation";

export type StepKind = "hot" | "cold" | "weighted_random" | "random";

export type SettingsState = {
  // each step kind is configured independently; the order is held in `stepOrder`
  hot: { recentRounds: number; count: number };
  cold: { recentRounds: number; count: number };
  weighted_random: {
    count: number;
    weights: { from: number; to: number; weight: number }[];
  };
  random: { count: number };
  stepOrder: StepKind[];
  enabled: Record<StepKind, boolean>;
  filters: Required<RecommendFilters>;

  setHot: (v: Partial<SettingsState["hot"]>) => void;
  setCold: (v: Partial<SettingsState["cold"]>) => void;
  setWeightedRandom: (v: Partial<SettingsState["weighted_random"]>) => void;
  setRandom: (v: Partial<SettingsState["random"]>) => void;
  setStepOrder: (order: StepKind[]) => void;
  setEnabled: (kind: StepKind, value: boolean) => void;
  setFilters: (v: Partial<SettingsState["filters"]>) => void;
  resetToDefault: () => void;

  buildSteps: () => Step[];
  snapshot: () => SettingsSnapshot;
  applySnapshot: (snap: SettingsSnapshot) => void;
};

export type SettingsSnapshot = Pick<
  SettingsState,
  "hot" | "cold" | "weighted_random" | "random" | "stepOrder" | "enabled" | "filters"
>;

const DEFAULTS: SettingsSnapshot = {
  hot: { recentRounds: 20, count: 2 },
  cold: { recentRounds: 20, count: 1 },
  weighted_random: {
    count: 1,
    weights: [
      { from: 1, to: 10, weight: 1.2 },
      { from: 11, to: 20, weight: 1.0 },
      { from: 21, to: 30, weight: 0.9 },
      { from: 31, to: 45, weight: 1.1 },
    ],
  },
  random: { count: 2 },
  stepOrder: ["hot", "cold", "weighted_random", "random"],
  enabled: { hot: true, cold: true, weighted_random: true, random: true },
  filters: {
    oddEvenRatio: [3, 3],
    lowHighRatio: [3, 3],
    sumRange: [100, 170],
    allowConsecutive: true,
    maxSameLastDigit: 2,
    excludePastWinningCombination: true,
  },
};

function withEnabledDefaults(
  e: Partial<Record<StepKind, boolean>> | undefined,
): Record<StepKind, boolean> {
  return { ...DEFAULTS.enabled, ...(e ?? {}) };
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      setHot: (v) => set((s) => ({ hot: { ...s.hot, ...v } })),
      setCold: (v) => set((s) => ({ cold: { ...s.cold, ...v } })),
      setWeightedRandom: (v) =>
        set((s) => ({ weighted_random: { ...s.weighted_random, ...v } })),
      setRandom: (v) => set((s) => ({ random: { ...s.random, ...v } })),
      setStepOrder: (order) => set({ stepOrder: order }),
      setEnabled: (kind, value) =>
        set((s) => ({ enabled: { ...s.enabled, [kind]: value } })),
      setFilters: (v) => set((s) => ({ filters: { ...s.filters, ...v } })),
      resetToDefault: () => set({ ...DEFAULTS }),
      snapshot: () => {
        const s = get();
        return {
          hot: { ...s.hot },
          cold: { ...s.cold },
          weighted_random: {
            count: s.weighted_random.count,
            weights: s.weighted_random.weights.map((w) => ({ ...w })),
          },
          random: { ...s.random },
          stepOrder: [...s.stepOrder],
          enabled: { ...s.enabled },
          filters: { ...s.filters },
        };
      },
      applySnapshot: (snap) =>
        set({ ...snap, enabled: withEnabledDefaults(snap.enabled) }),
      buildSteps: () => {
        const s = get();
        return s.stepOrder
          .map<Step | null>((kind) => {
            if (!s.enabled[kind]) return null;
            switch (kind) {
              case "hot":
                if (s.hot.count <= 0) return null;
                return { type: "hot", ...s.hot };
              case "cold":
                if (s.cold.count <= 0) return null;
                return { type: "cold", ...s.cold };
              case "weighted_random":
                if (s.weighted_random.count <= 0) return null;
                return {
                  type: "weighted_random",
                  count: s.weighted_random.count,
                  weights: s.weighted_random.weights,
                };
              case "random":
                if (s.random.count <= 0) return null;
                return { type: "random", count: s.random.count };
            }
          })
          .filter((x): x is Step => x !== null);
      },
    }),
    {
      name: "lottery-settings-v1",
      // Backfill `enabled` (added later) for users with older persisted state.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
          enabled: withEnabledDefaults(p.enabled),
        };
      },
    },
  ),
);

export const STEP_LABEL: Record<StepKind, string> = {
  hot: "Hot Number",
  cold: "Cold Number",
  weighted_random: "Weighted Random",
  random: "Pure Random",
};
