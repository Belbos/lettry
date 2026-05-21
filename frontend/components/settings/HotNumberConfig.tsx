"use client";

import { useSettingsStore } from "@/lib/store/settingsStore";
import { NumberInput } from "@/components/common/NumberInput";

export function HotNumberConfig() {
  const hot = useSettingsStore((s) => s.hot);
  const setHot = useSettingsStore((s) => s.setHot);

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Hot Number</h3>
        <span className="text-xs text-slate-500">최근 N회 자주 출현한 번호</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label className="flex items-center justify-between gap-3">
          <span>최근 회차</span>
          <NumberInput
            value={hot.recentRounds}
            onChange={(v) => setHot({ recentRounds: Math.max(1, v) })}
            min={1}
            max={10000}
            ariaLabel="hot recent rounds"
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>선택 개수</span>
          <NumberInput
            value={hot.count}
            onChange={(v) => setHot({ count: Math.max(0, Math.min(6, v)) })}
            min={0}
            max={6}
            ariaLabel="hot count"
          />
        </label>
      </div>
    </section>
  );
}
