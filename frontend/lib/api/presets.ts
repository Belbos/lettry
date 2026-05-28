import { apiFetch } from "./client";
import type { Preset, PresetConfig } from "@/lib/types/preset";

export async function listPresets(): Promise<Preset[]> {
  return apiFetch<Preset[]>("/api/presets");
}

export async function createPreset(
  name: string,
  config: PresetConfig,
): Promise<Preset> {
  return apiFetch<Preset>("/api/presets", {
    method: "POST",
    body: JSON.stringify({ name, config }),
  });
}

export async function updatePreset(
  id: number,
  name: string,
  config: PresetConfig,
): Promise<Preset> {
  return apiFetch<Preset>(`/api/presets/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, config }),
  });
}

export async function deletePreset(id: number): Promise<void> {
  await apiFetch<void>(`/api/presets/${id}`, { method: "DELETE" });
}

export async function setPresetDefault(id: number): Promise<Preset> {
  return apiFetch<Preset>(`/api/presets/${id}/default`, { method: "POST" });
}
