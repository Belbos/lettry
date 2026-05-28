"use client";

import { useState } from "react";
import { checkNumbers } from "@/lib/api/check";
import { ApiError } from "@/lib/api/client";
import type { CheckResponse } from "@/lib/types/check";

const RANK_LABEL: Record<string, string> = {
  "1": "1등",
  "2": "2등",
  "3": "3등",
  "4": "4등",
  "5": "5등",
};

export function WinCheck({ numbers }: { numbers: number[] }) {
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      setResult(await checkNumbers(numbers));
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { detail?: string } | undefined;
        setError(typeof body?.detail === "string" ? body.detail : e.message);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  const wonRanks = result
    ? Object.entries(result.rankCounts)
        .filter(([, n]) => n > 0)
        .sort(([a], [b]) => Number(a) - Number(b))
    : [];

  return (
    <div className="space-y-2">
      {!result && (
        <button
          onClick={handleCheck}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "대조 중…" : "역대 당첨 대조"}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="text-xs rounded-md border bg-slate-50 p-3 space-y-1">
          {result.best ? (
            <div className="font-semibold text-slate-800">
              🏆 역대 최고 {RANK_LABEL[String(result.best.rank)]} —{" "}
              {result.best.drawNo}회차에서 {result.best.matchCount}개 일치
              {result.best.bonusMatch ? " + 보너스" : ""}
            </div>
          ) : (
            <div className="text-slate-600">
              과거 {result.totalDraws}회 중 당첨(3개 이상 일치) 이력이 없습니다.
            </div>
          )}
          {wonRanks.length > 0 && (
            <div className="text-slate-500">
              {wonRanks
                .map(([r, n]) => `${RANK_LABEL[r]} ${n}회`)
                .join(" · ")}{" "}
              <span className="text-slate-400">
                (과거 {result.totalDraws}회 기준)
              </span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">
            과거 회차와의 단순 대조이며 미래 당첨과 무관합니다.
          </p>
        </div>
      )}
    </div>
  );
}
