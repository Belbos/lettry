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
          {loading ? "분석 중…" : "과거 회차와 일치도 비교"}
        </button>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {result && (
        <div className="text-xs rounded-md border bg-slate-50 p-3 space-y-1">
          {result.best ? (
            <div className="font-semibold text-slate-800">
              📊 과거 회차 중 최다 일치: {result.best.drawNo}회차에서{" "}
              {result.best.matchCount}개 일치
              {result.best.bonusMatch ? " + 보너스" : ""}{" "}
              <span className="text-slate-500 font-normal">
                (당시 회차 {RANK_LABEL[String(result.best.rank)]} 기준)
              </span>
            </div>
          ) : (
            <div className="text-slate-600">
              과거 {result.totalDraws}회 중 3개 이상 일치한 회차가 없습니다.
            </div>
          )}
          {wonRanks.length > 0 && (
            <div className="text-slate-500">
              일치 회차 분포:{" "}
              {wonRanks
                .map(([r, n]) => `${RANK_LABEL[r]} 기준 ${n}회`)
                .join(" · ")}{" "}
              <span className="text-slate-400">
                (과거 {result.totalDraws}회 통계)
              </span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">
            과거 회차와의 단순 일치 통계이며, 향후 추첨 결과와 무관합니다.
          </p>
        </div>
      )}
    </div>
  );
}
