"use client";

import { create } from "zustand";
import {
  createPreset,
  deletePreset,
  listPresets,
  setPresetDefault,
  updatePreset,
} from "@/lib/api/presets";
import type { Preset, PresetConfig } from "@/lib/types/preset";

export type { Preset, PresetConfig } from "@/lib/types/preset";

type PresetState = {
  presets: Preset[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  add: (name: string, config: PresetConfig) => Promise<void>;
  update: (id: number, name: string, config: PresetConfig) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setDefault: (id: number) => Promise<void>;
  reset: () => void;
};

export const usePresetStore = create<PresetState>()((set) => ({
  presets: [],
  loading: false,
  loaded: false,
  load: async () => {
    set({ loading: true });
    try {
      const presets = await listPresets();
      set({ presets, loaded: true });
    } finally {
      set({ loading: false });
    }
  },
  add: async (name, config) => {
    await createPreset(name, config);
    set({ presets: await listPresets() });
  },
  update: async (id, name, config) => {
    await updatePreset(id, name, config);
    set({ presets: await listPresets() });
  },
  remove: async (id) => {
    await deletePreset(id);
    set({ presets: await listPresets() });
  },
  setDefault: async (id) => {
    await setPresetDefault(id);
    set({ presets: await listPresets() });
  },
  reset: () => set({ presets: [], loaded: false }),
}));
