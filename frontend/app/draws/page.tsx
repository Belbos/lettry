"use client";

import { useEffect, useState } from "react";
import { LottoBall } from "@/components/lotto/LottoBall";
import { Pagination } from "@/components/common/Pagination";
import { ApiError } from "@/lib/api/client";
import { listDraws } from "@/lib/api/draws";
import type { DrawListResponse } from "@/lib/types/draw";

const PER_PAGE = 10;

export default function DrawsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<DrawListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listDraws(PER_PAGE, page * PER_PAGE)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">전체 당첨번호</h1>
        <p className="text-sm text-slate-600 mt-1">
          등록된 모든 회차의 당첨번호를 최신순으로 확인합니다.
          {data ? ` (총 ${data.total.toLocaleString()}회)` : ""}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="text-sm text-slate-500">불러오는 중…</div>
      ) : data && data.items.length === 0 ? (
        <div className="text-sm text-slate-500 bg-white border rounded-2xl p-8 text-center">
          등록된 회차가 없습니다.
        </div>
      ) : (
        data && (
          <ul className="space-y-2">
            {data.items.map((d) => (
              <li
                key={d.draw_no}
                className="bg-white border rounded-xl p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="w-28 shrink-0">
                  <div className="font-semibold tabular-nums">{d.draw_no}회</div>
                  <div className="text-xs text-slate-500">{d.draw_date}</div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {d.numbers.map((n) => (
                    <LottoBall key={n} value={n} size="sm" />
                  ))}
                  <span className="text-slate-400 mx-1">+</span>
                  <LottoBall value={d.bonus_number} size="sm" />
                </div>
              </li>
            ))}
          </ul>
        )
      )}

      {data && data.total > PER_PAGE && (
        <Pagination
          page={page}
          perPage={PER_PAGE}
          total={data.total}
          onChange={setPage}
        />
      )}
    </div>
  );
}
