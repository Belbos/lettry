"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecommendFilters } from "@/lib/types/recommendation";
import type { StepKind } from "./settingsStore";

export type PresetConfig = {
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
};

export type Preset = {
  id: string;
  name: string;
  config: PresetConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type PresetState = {
  presets: Preset[];
  add: (name: string, config: PresetConfig) => Preset;
  update: (id: string, name: string, config: PresetConfig) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  getDefault: () => Preset | null;
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      add: (name, config) => {
        const now = new Date().toISOString();
        const p: Preset = {
          id: uid(),
          name: name.trim() || "이름 없음",
          config,
          isDefault: get().presets.length === 0,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ presets: [p, ...s.presets] }));
        return p;
      },
      update: (id, name, config) => {
        set((s) => ({
          presets: s.presets.map((p) =>
            p.id === id
              ? { ...p, name: name.trim() || p.name, config, updatedAt: new Date().toISOString() }
              : p,
          ),
        }));
      },
      remove: (id) => {
        set((s) => ({ presets: s.presets.filter((p) => p.id !== id) }));
      },
      setDefault: (id) => {
        set((s) => ({
          presets: s.presets.map((p) => ({ ...p, isDefault: p.id === id })),
        }));
      },
      getDefault: () => get().presets.find((p) => p.isDefault) ?? null,
    }),
    { name: "lottery-presets-v1" },
  ),
);
