import type { RecommendFilters } from "@/lib/types/recommendation";
import type { StepKind } from "@/lib/store/settingsStore";

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
  id: number;
  name: string;
  config: PresetConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};
