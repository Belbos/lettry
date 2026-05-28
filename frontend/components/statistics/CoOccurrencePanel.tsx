"use client";

import { LottoBall } from "@/components/lotto/LottoBall";
import type { PairItem } from "@/lib/types/statistics";

type Props = { items: PairItem[]; rangeLabel: string };

export function CoOccurrencePanel({ items, rangeLabel }: Props) {
  const max = items.length > 0 ? items[0].count : 0;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        자주 함께 나온 번호쌍 ({rangeLabel})
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={`${it.a}-${it.b}`} className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <LottoBall value={it.a} size="sm" />
                <LottoBall value={it.b} size="sm" />
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-700"
                    style={{ width: `${max > 0 ? (it.count / max) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-slate-600 tabular-nums w-10 text-right">
                {it.count}회
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
