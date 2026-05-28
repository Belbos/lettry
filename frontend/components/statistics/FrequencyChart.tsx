"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NumberFrequencyItem } from "@/lib/types/statistics";

type Props = { items: NumberFrequencyItem[]; height?: number };

export function FrequencyChart({ items, height = 280 }: Props) {
  const data = items.map((it) => ({ number: it.number, count: it.count }));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="number"
            tick={{ fontSize: 10 }}
            interval={0}
            ticks={[1, 5, 10, 15, 20, 25, 30, 35, 40, 45]}
          />
          <YAxis tick={{ fontSize: 11 }} width={32} />
          <Tooltip
            formatter={(v) => [`${v}회`, "출현"]}
            labelFormatter={(l) => `번호 ${l}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#334155" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
