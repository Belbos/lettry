"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  getCold,
  getFrequency,
  getHot,
  getOverdue,
  getPairs,
  getSummary,
} from "@/lib/api/statistics";
import type {
  HotColdResponse,
  NumberFrequencyResponse,
  OverdueResponse,
  PairResponse,
  StatRange,
  StatisticsSummary,
} from "@/lib/types/statistics";
import { FrequencyChart } from "@/components/statistics/FrequencyChart";
import { HotColdPanel } from "@/components/statistics/HotColdPanel";
import { RatioCard } from "@/components/statistics/RatioCard";
import { SumDistributionChart } from "@/components/statistics/SumDistributionChart";
import { OverduePanel } from "@/components/statistics/OverduePanel";
import { CoOccurrencePanel } from "@/components/statistics/CoOccurrencePanel";
import { SyncButton } from "@/components/statistics/SyncButton";

const RANGE_OPTIONS: { value: StatRange; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "last_100", label: "최근 100회" },
  { value: "last_50", label: "최근 50회" },
  { value: "last_20", label: "최근 20회" },
];

export default function StatisticsPage() {
  const [range, setRange] = useState<StatRange>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [frequency, setFrequency] = useState<NumberFrequencyResponse | null>(null);
  const [hot, setHot] = useState<HotColdResponse | null>(null);
  const [cold, setCold] = useState<HotColdResponse | null>(null);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [overdue, setOverdue] = useState<OverdueResponse | null>(null);
  const [pairs, setPairs] = useState<PairResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [f, h, c, s, o, p] = await Promise.all([
          getFrequency(range),
          getHot(range === "all" ? "last_20" : range, 6),
          getCold(range === "all" ? "last_20" : range, 6),
          getSummary(),
          getOverdue(),
          getPairs(range, 15),
        ]);
        if (cancelled) return;
        setFrequency(f);
        setHot(h);
        setCold(c);
        setSummary(s);
        setOverdue(o);
        setPairs(p);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">통계 대시보드</h1>
          <p className="text-sm text-slate-600 mt-1">
            번호별 출현 빈도, Hot/Cold, 미출현 기간, 동시출현 번호쌍, 합계 분포, 홀짝·고저 비율을 확인합니다.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  range === opt.value
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <SyncButton
            onSuccess={(res) => {
              if (res.inserted > 0) setReloadKey((k) => k + 1);
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading && !frequency && (
        <div className="text-sm text-slate-500">불러오는 중...</div>
      )}

      {summary && (
        <section className="bg-white border rounded-2xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat label="전체 회차" value={summary.total_draws.toLocaleString()} />
            <Stat label="평균 합계" value={summary.sum_avg.toFixed(1)} />
            <Stat
              label="합계 범위"
              value={`${summary.sum_min} ~ ${summary.sum_max}`}
            />
            <Stat
              label="평균 연속쌍"
              value={summary.consecutive_pair_avg.toFixed(2)}
            />
          </div>
        </section>
      )}

      {frequency && (
        <section className="bg-white border rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold">번호별 출현 횟수 ({frequency.total_draws}회 기준)</h2>
          <FrequencyChart items={frequency.items} />
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {hot && (
          <section className="bg-white border rounded-2xl p-5">
            <HotColdPanel title={`Hot Top 6 (${labelOf(hot.range)})`} items={hot.items} />
          </section>
        )}
        {cold && (
          <section className="bg-white border rounded-2xl p-5">
            <HotColdPanel title={`Cold Top 6 (${labelOf(cold.range)})`} items={cold.items} />
          </section>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {overdue && (
          <section className="bg-white border rounded-2xl p-5">
            <OverduePanel items={overdue.items} />
            <p className="text-[11px] text-slate-400 mt-3">
              최신 {overdue.latest_draw_no}회 기준, 전체 {overdue.total_draws}회 분석
            </p>
          </section>
        )}
        {pairs && (
          <section className="bg-white border rounded-2xl p-5">
            <CoOccurrencePanel items={pairs.items} rangeLabel={labelOf(pairs.range)} />
          </section>
        )}
      </div>

      {summary && (
        <div className="grid lg:grid-cols-3 gap-4">
          <section className="bg-white border rounded-2xl p-5 lg:col-span-1">
            <RatioCard
              title="평균 홀 / 짝 (전체 회차)"
              leftLabel="홀"
              rightLabel="짝"
              leftValue={summary.odd_even_avg[0]}
              rightValue={summary.odd_even_avg[1]}
            />
          </section>
          <section className="bg-white border rounded-2xl p-5 lg:col-span-1">
            <RatioCard
              title="평균 저(1~22) / 고(23~45)"
              leftLabel="저"
              rightLabel="고"
              leftValue={summary.low_high_avg[0]}
              rightValue={summary.low_high_avg[1]}
            />
          </section>
          <section className="bg-white border rounded-2xl p-5 lg:col-span-1">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">합계 분포</h3>
            <SumDistributionChart buckets={summary.sum_distribution} />
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function labelOf(r: StatRange): string {
  return {
    all: "전체",
    last_20: "최근 20회",
    last_50: "최근 50회",
    last_100: "최근 100회",
  }[r];
}
