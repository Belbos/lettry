"use client";

import { useSettingsStore } from "@/lib/store/settingsStore";
import { NumberInput } from "@/components/common/NumberInput";

export function WeightedRandomConfig() {
  const wr = useSettingsStore((s) => s.weighted_random);
  const setWR = useSettingsStore((s) => s.setWeightedRandom);

  function updateWeight(idx: number, patch: Partial<{ from: number; to: number; weight: number }>) {
    const next = wr.weights.map((w, i) => (i === idx ? { ...w, ...patch } : w));
    setWR({ weights: next });
  }
  function addRow() {
    setWR({ weights: [...wr.weights, { from: 1, to: 45, weight: 1.0 }] });
  }
  function removeRow(idx: number) {
    setWR({ weights: wr.weights.filter((_, i) => i !== idx) });
  }

  return (
    <section className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Weighted Random</h3>
        <span className="text-xs text-slate-500">구간별 가중치 적용</span>
      </div>

      <label className="flex items-center justify-between gap-3 text-sm max-w-xs">
        <span>선택 개수</span>
        <NumberInput
          value={wr.count}
          onChange={(v) => setWR({ count: Math.max(0, Math.min(6, v)) })}
          min={0}
          max={6}
          ariaLabel="weighted random count"
        />
      </label>

      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 px-1">
          <span className="col-span-3">From</span>
          <span className="col-span-3">To</span>
          <span className="col-span-3">Weight</span>
          <span className="col-span-3" />
        </div>
        {wr.weights.map((w, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3">
              <NumberInput
                value={w.from}
                onChange={(v) => updateWeight(idx, { from: Math.max(1, Math.min(45, v)) })}
                min={1}
                max={45}
                ariaLabel={`weight ${idx} from`}
              />
            </div>
            <div className="col-span-3">
              <NumberInput
                value={w.to}
                onChange={(v) => updateWeight(idx, { to: Math.max(1, Math.min(45, v)) })}
                min={1}
                max={45}
                ariaLabel={`weight ${idx} to`}
              />
            </div>
            <div className="col-span-3">
              <NumberInput
                value={w.weight}
                onChange={(v) => updateWeight(idx, { weight: Math.max(0.01, v) })}
                min={0.01}
                step={0.1}
                ariaLabel={`weight ${idx} weight`}
              />
            </div>
            <div className="col-span-3 flex justify-end">
              <button
                onClick={() => removeRow(idx)}
                className="text-xs text-red-600 hover:text-red-700"
                aria-label={`remove weight row ${idx}`}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addRow}
          className="text-sm text-slate-700 hover:text-slate-900 underline underline-offset-2"
        >
          + 구간 추가
        </button>
      </div>
    </section>
  );
}
