"use client";

import { useEffect, useState } from "react";
import { LottoNumberSet } from "@/components/lotto/LottoNumberSet";
import { WinCheck } from "@/components/lotto/WinCheck";
import { useHistoryStore } from "@/lib/store/historyStore";
import { useAuthStore } from "@/lib/store/authStore";
import { LoginRequired } from "@/components/auth/LoginRequired";

const STEP_LABEL: Record<string, string> = {
  hot: "Hot",
  cold: "Cold",
  weighted_random: "Weighted Random",
  random: "Random",
  filter_validation: "필터 검증",
};

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  const diffSec = Math.floor((Date.now() - t) / 1000);
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

export default function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const entries = useHistoryStore((s) => s.entries);
  const loaded = useHistoryStore((s) => s.loaded);
  const load = useHistoryStore((s) => s.load);
  const clear = useHistoryStore((s) => s.clear);
  const reset = useHistoryStore((s) => s.reset);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (user) {
      load().catch(() => {});
    } else {
      reset();
    }
  }, [user, load, reset]);

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">추천 이력</h1>
          <p className="text-sm text-slate-600 mt-1">
            로그인하면 추천 결과가 계정에 자동으로 기록됩니다.
          </p>
        </div>
        <LoginRequired message="추천 이력은 로그인 후 이용할 수 있습니다." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold">추천 이력</h1>
          <p className="text-sm text-slate-600 mt-1">
            최근 추천 결과 최대 100건 (계정에 저장).
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => {
              if (confirmClear) {
                clear().catch(() => {});
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
                setTimeout(() => setConfirmClear(false), 3000);
              }
            }}
            className="text-xs text-slate-600 hover:text-red-600 underline underline-offset-2"
          >
            {confirmClear ? "한 번 더 클릭하면 전체 삭제" : "전체 삭제"}
          </button>
        )}
      </div>

      {!loaded ? (
        <div className="text-sm text-slate-500 bg-white border rounded-2xl p-8 text-center">
          불러오는 중…
        </div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-slate-500 bg-white border rounded-2xl p-8 text-center">
          아직 추천 이력이 없습니다. 메인 화면에서 번호 추천을 받아보세요.
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="bg-white border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{formatRelative(e.createdAt)}</span>
                {e.presetName && (
                  <span className="px-2 py-0.5 rounded bg-slate-100">
                    프리셋: {e.presetName}
                  </span>
                )}
              </div>
              <LottoNumberSet numbers={e.numbers} size="md" />
              <div className="text-xs text-slate-600 text-center">
                홀 {e.summary.oddCount} / 짝 {e.summary.evenCount} · 저{" "}
                {e.summary.lowCount} / 고 {e.summary.highCount} · 합{" "}
                {e.summary.sum} · 연속 {e.summary.consecutivePairs}쌍
              </div>
              <div className="text-xs text-slate-400 text-center">
                {e.appliedSteps.map((s) => STEP_LABEL[s] ?? s).join(" → ")}
              </div>
              <div className="flex justify-center">
                <WinCheck numbers={e.numbers} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
