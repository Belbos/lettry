"use client";

import { useSettingsStore } from "@/lib/store/settingsStore";
import { NumberInput } from "@/components/common/NumberInput";

export function FilterConfig() {
  const filters = useSettingsStore((s) => s.filters);
  const setFilters = useSettingsStore((s) => s.setFilters);

  return (
    <section className="bg-white rounded-xl border p-5 space-y-4">
      <h3 className="font-semibold">필터</h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span>홀 / 짝 비율</span>
          <div className="flex items-center gap-2">
            <NumberInput
              value={filters.oddEvenRatio[0]}
              onChange={(v) =>
                setFilters({
                  oddEvenRatio: [
                    Math.max(0, Math.min(6, v)),
                    6 - Math.max(0, Math.min(6, v)),
                  ],
                })
              }
              min={0}
              max={6}
              ariaLabel="odd count"
            />
            <span className="text-slate-400">:</span>
            <span className="w-20 text-center tabular-nums text-slate-700">
              {filters.oddEvenRatio[1]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span>저(1~22) / 고(23~45) 비율</span>
          <div className="flex items-center gap-2">
            <NumberInput
              value={filters.lowHighRatio[0]}
              onChange={(v) =>
                setFilters({
                  lowHighRatio: [
                    Math.max(0, Math.min(6, v)),
                    6 - Math.max(0, Math.min(6, v)),
                  ],
                })
              }
              min={0}
              max={6}
              ariaLabel="low count"
            />
            <span className="text-slate-400">:</span>
            <span className="w-20 text-center tabular-nums text-slate-700">
              {filters.lowHighRatio[1]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span>번호 합계 범위</span>
          <div className="flex items-center gap-2">
            <NumberInput
              value={filters.sumRange[0]}
              onChange={(v) =>
                setFilters({ sumRange: [Math.max(21, v), filters.sumRange[1]] })
              }
              min={21}
              max={255}
              ariaLabel="sum min"
            />
            <span className="text-slate-400">~</span>
            <NumberInput
              value={filters.sumRange[1]}
              onChange={(v) =>
                setFilters({ sumRange: [filters.sumRange[0], Math.min(255, v)] })
              }
              min={21}
              max={255}
              ariaLabel="sum max"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span>같은 끝수 최대 허용</span>
          <NumberInput
            value={filters.maxSameLastDigit}
            onChange={(v) =>
              setFilters({ maxSameLastDigit: Math.max(1, Math.min(6, v)) })
            }
            min={1}
            max={6}
            ariaLabel="max same last digit"
          />
        </div>

        <label className="flex items-center justify-between gap-3">
          <span>연속번호 허용</span>
          <input
            type="checkbox"
            checked={filters.allowConsecutive}
            onChange={(e) => setFilters({ allowConsecutive: e.target.checked })}
            className="h-4 w-4"
          />
        </label>

        <label className="flex items-center justify-between gap-3">
          <span>과거 당첨 조합과 동일하면 제외</span>
          <input
            type="checkbox"
            checked={filters.excludePastWinningCombination}
            onChange={(e) =>
              setFilters({ excludePastWinningCombination: e.target.checked })
            }
            className="h-4 w-4"
          />
        </label>
      </div>
    </section>
  );
}
