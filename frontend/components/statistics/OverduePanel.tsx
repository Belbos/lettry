"use client";

import { LottoBall } from "@/components/lotto/LottoBall";
import type { OverdueItem } from "@/lib/types/statistics";

type Props = { items: OverdueItem[]; limit?: number };

export function OverduePanel({ items, limit = 10 }: Props) {
  const top = items.slice(0, limit);
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        오래 안 나온 번호 (미출현 기간)
      </h3>
      <div className="flex flex-wrap gap-3">
        {top.map((it) => (
          <div key={it.number} className="flex flex-col items-center gap-1">
            <LottoBall value={it.number} size="md" />
            <span className="text-xs text-slate-600 tabular-nums">
              {it.gap}회 전
            </span>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {it.last_draw_no ? `${it.last_draw_no}회` : "기록 없음"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
