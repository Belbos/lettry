"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/client";
import { postSync } from "@/lib/api/sync";
import type { SyncResponse } from "@/lib/types/sync";

type Props = {
  /** Called after a successful sync (e.g. to refresh statistics). */
  onSuccess?: (res: SyncResponse) => void;
};

export function SyncButton({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await postSync(20);
      setResult(res);
      onSuccess?.(res);
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { detail?: string } | undefined;
        const detail = typeof body?.detail === "string" ? body.detail : e.message;
        // Upstream (502) errors from dhlottery — give a friendly explanation.
        if (e.status === 502) {
          setError(
            `동행복권 서버에 자동 요청이 차단되었습니다. (잠시 후 다시 시도하거나 CSV import 사용)\n원본 오류: ${detail}`,
          );
        } else {
          setError(detail);
        }
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-slate-50 disabled:opacity-50"
        title="동행복권에서 최신 회차 자동 가져오기"
      >
        {loading ? "동기화 중..." : "최신 회차 동기화"}
      </button>

      {result && (
        <div
          className={`text-xs rounded-md p-2 max-w-md ${
            result.inserted > 0
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-slate-50 border text-slate-700"
          }`}
        >
          {result.inserted > 0 ? (
            <>
              <div className="font-semibold mb-0.5">
                ✓ {result.inserted}회차 추가됨 (총 {result.total}회)
              </div>
              <div>새 회차: {result.new_draw_nos.join(", ")}</div>
            </>
          ) : (
            <div>
              새로 추가된 회차 없음. 현재 DB 최신: {result.started_from - 1}회 (총{" "}
              {result.total}회)
            </div>
          )}
          {result.note && (
            <div className="text-slate-500 mt-1">{result.note}</div>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs rounded-md p-2 max-w-md bg-red-50 border border-red-200 text-red-700 whitespace-pre-line">
          {error}
        </div>
      )}
    </div>
  );
}
