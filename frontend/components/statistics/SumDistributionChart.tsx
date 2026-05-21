"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SumDistributionBucket } from "@/lib/types/statistics";

type Props = { buckets: SumDistributionBucket[]; height?: number };

export function SumDistributionChart({ buckets, height = 240 }: Props) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={buckets} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="bucket" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={48} />
          <YAxis tick={{ fontSize: 11 }} width={32} />
          <Tooltip
            formatter={(v: number) => [`${v}회`, "출현"]}
            labelFormatter={(l) => `합계 ${l}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
