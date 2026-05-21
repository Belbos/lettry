"use client";

import { useSettingsStore } from "@/lib/store/settingsStore";
import { NumberInput } from "@/components/common/NumberInput";

export function RandomConfig() {
  const random = useSettingsStore((s) => s.random);
  const setRandom = useSettingsStore((s) => s.setRandom);

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Pure Random</h3>
        <span className="text-xs text-slate-500">무작위 번호</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label className="flex items-center justify-between gap-3 col-span-2 max-w-xs">
          <span>선택 개수</span>
          <NumberInput
            value={random.count}
            onChange={(v) => setRandom({ count: Math.max(0, Math.min(6, v)) })}
            min={0}
            max={6}
            ariaLabel="random count"
          />
        </label>
      </div>
    </section>
  );
}
