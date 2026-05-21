"use client";

import { LottoBall } from "@/components/lotto/LottoBall";
import type { HotColdItem } from "@/lib/types/statistics";

type Props = { title: string; items: HotColdItem[] };

export function HotColdPanel({ title, items }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {items.map((it) => (
          <div key={it.number} className="flex flex-col items-center gap-1">
            <LottoBall value={it.number} size="md" />
            <span className="text-xs text-slate-500 tabular-nums">{it.count}회</span>
          </div>
        ))}
      </div>
    </div>
  );
}
