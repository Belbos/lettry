"use client";

import { useState } from "react";
import Link from "next/link";
import { LottoNumberSet } from "@/components/lotto/LottoNumberSet";
import { postRecommend } from "@/lib/api/recommend";
import { ApiError } from "@/lib/api/client";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { useHistoryStore } from "@/lib/store/historyStore";
import type { RecommendResponse } from "@/lib/types/recommendation";

const STEP_LABEL: Record<string, string> = {
  hot: "Hot",
  cold: "Cold",
  weighted_random: "Weighted Random",
  random: "Random",
  filter_validation: "필터 검증",
};

export default function HomePage() {
  const buildSteps = useSettingsStore((s) => s.buildSteps);
  const filters = useSettingsStore((s) => s.filters);
  const pushHistory = useHistoryStore((s) => s.push);

  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecommend() {
    setLoading(true);
    setError(null);
    try {
      const steps = buildSteps();
      if (steps.length === 0) {
        setError("최소 한 블록 이상에서 count > 0 으로 설정해야 합니다. 설정 화면에서 조정하세요.");
        return;
      }
      const res = await postRecommend({ steps, filters });
      setResult(res);
      pushHistory({
        numbers: res.numbers,
        summary: res.summary,
        appliedSteps: res.appliedSteps,
        presetName: null,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { detail?: { message?: string } | string } | undefined;
        const msg =
          typeof body?.detail === "string"
            ? body.detail
            : body?.detail?.message ?? e.message;
        setError(msg);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          로또 번호 추천 (엔터테인먼트용)
        </h1>
        <p className="text-sm text-slate-600">
          과거 당첨 데이터 기반 통계와 사용자 설정으로 번호 6개를 생성합니다.
        </p>
        <p className="text-xs text-slate-500">
          <Link href="/settings" className="underline underline-offset-2 hover:text-slate-700">
            알고리즘 설정 변경
          </Link>
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        {result ? (
          <LottoNumberSet numbers={result.numbers} size="lg" />
        ) : (
          <div className="flex gap-3 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-full border-2 border-dashed border-slate-200"
              />
            ))}
          </div>
        )}

        {result && (
          <div className="text-center text-sm text-slate-600 space-y-2">
            <div>
              적용 단계:{" "}
              {result.appliedSteps.map((s) => STEP_LABEL[s] ?? s).join(" → ")}
            </div>
            <div>
              요약: 홀 {result.summary.oddCount} / 짝 {result.summary.evenCount} ·
              저 {result.summary.lowCount} / 고 {result.summary.highCount} ·
              합 {result.summary.sum} · 연속 {result.summary.consecutivePairs}쌍
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleRecommend}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "추천 중..." : "번호 추천 받기"}
          </button>
        </div>
      </section>

      {result && (
        <section className="bg-white rounded-2xl border p-6 text-sm text-slate-700">
          <h2 className="font-semibold mb-3">단계별 결과</h2>
          <ul className="space-y-2">
            {result.stepResults.map((sr, i) => (
              <li key={i} className="flex gap-3 items-center">
                <span className="text-xs font-mono bg-slate-100 rounded px-2 py-0.5">
                  {STEP_LABEL[sr.type] ?? sr.type}
                </span>
                <span className="text-slate-600">
                  {sr.pickedNumbers.length > 0
                    ? `[${sr.pickedNumbers.join(", ")}]`
                    : "(no pick)"}
                </span>
                {sr.note && (
                  <span className="text-xs text-slate-400">— {sr.note}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
