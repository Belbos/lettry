"use client";

import { useCallback, useEffect, useState } from "react";
import { Pagination } from "@/components/common/Pagination";
import { ApiError } from "@/lib/api/client";
import { listDraws } from "@/lib/api/draws";
import { upsertDraw } from "@/lib/api/admin";
import type { Draw } from "@/lib/types/draw";

const PER_PAGE = 10;
const EMPTY_NUMBERS = ["", "", "", "", "", ""];

type EditRow = { draw_date: string; numbers: string[]; bonus: string };
type RowStatus = { id: number; ok?: string; err?: string };

function errMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const body = e.body as { detail?: unknown } | undefined;
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0] && typeof d[0] === "object" && "msg" in d[0]) {
      return String((d[0] as { msg: unknown }).msg);
    }
    return e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

function seed(items: Draw[]): Record<number, EditRow> {
  const out: Record<number, EditRow> = {};
  for (const d of items) {
    out[d.draw_no] = {
      draw_date: d.draw_date,
      numbers: d.numbers.map(String),
      bonus: String(d.bonus_number),
    };
  }
  return out;
}

export function AdminDrawsSection() {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Draw[]>([]);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<Record<number, EditRow>>({});
  const [latestDrawNo, setLatestDrawNo] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [status, setStatus] = useState<RowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New-draw row inputs.
  const [newNo, setNewNo] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNumbers, setNewNumbers] = useState<string[]>([...EMPTY_NUMBERS]);
  const [newBonus, setNewBonus] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await listDraws(PER_PAGE, page * PER_PAGE);
      setItems(res.items);
      setTotal(res.total);
      setRows(seed(res.items));
      const latest = await listDraws(1, 0);
      const max = latest.items[0]?.draw_no ?? 0;
      setLatestDrawNo(max || null);
      setNewNo((prev) => prev || String(max + 1));
    } catch (e) {
      setError(errMessage(e));
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  function setField(no: number, patch: Partial<EditRow>) {
    setRows((r) => ({ ...r, [no]: { ...r[no], ...patch } }));
  }
  function setNum(no: number, idx: number, v: string) {
    setRows((r) => ({
      ...r,
      [no]: { ...r[no], numbers: r[no].numbers.map((x, i) => (i === idx ? v : x)) },
    }));
  }

  async function save(drawNo: number, row: EditRow) {
    setSavingId(drawNo);
    setStatus(null);
    try {
      await upsertDraw({
        draw_no: drawNo,
        draw_date: row.draw_date,
        numbers: row.numbers.map(Number),
        bonus_number: Number(row.bonus),
      });
      setStatus({ id: drawNo, ok: "저장됨" });
      await load();
    } catch (e) {
      setStatus({ id: drawNo, err: errMessage(e) });
    } finally {
      setSavingId(null);
    }
  }

  const newValid =
    newNo &&
    newDate &&
    newNumbers.every((n) => n !== "") &&
    newBonus;

  async function addNew() {
    setSavingId("new");
    setStatus(null);
    try {
      await upsertDraw({
        draw_no: Number(newNo),
        draw_date: newDate,
        numbers: newNumbers.map(Number),
        bonus_number: Number(newBonus),
      });
      setNewDate("");
      setNewNumbers([...EMPTY_NUMBERS]);
      setNewBonus("");
      setNewNo("");
      setPage(0);
      await load();
      setStatus({ id: -1, ok: "새 회차가 추가되었습니다" });
    } catch (e) {
      setStatus({ id: -1, err: errMessage(e) });
    } finally {
      setSavingId(null);
    }
  }

  const numInput =
    "w-12 border rounded px-1 py-1 text-sm text-center";

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold text-sm">당첨번호 관리</h2>
        <p className="text-xs text-slate-500 mt-1">
          최신 회차부터 표시됩니다. 각 회차를 수정 후 저장하거나, 상단에서 새 회차를 추가하세요. (총{" "}
          {total.toLocaleString()}회)
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs">
            <tr>
              <th className="px-3 py-2 text-left">회차</th>
              <th className="px-3 py-2 text-left">추첨일</th>
              <th className="px-3 py-2 text-left" colSpan={6}>당첨번호</th>
              <th className="px-3 py-2 text-left">보너스</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {/* New draw row */}
            <tr className="border-t bg-amber-50/40">
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={newNo}
                  onChange={(e) => setNewNo(e.target.value)}
                  placeholder={latestDrawNo ? String(latestDrawNo + 1) : "회차"}
                  className="w-16 border rounded px-1 py-1 text-sm"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="border rounded px-1 py-1 text-sm"
                />
              </td>
              {newNumbers.map((n, i) => (
                <td key={i} className="px-1 py-2">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={n}
                    onChange={(e) =>
                      setNewNumbers((arr) =>
                        arr.map((x, idx) => (idx === i ? e.target.value : x)),
                      )
                    }
                    className={numInput}
                  />
                </td>
              ))}
              <td className="px-1 py-2">
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={newBonus}
                  onChange={(e) => setNewBonus(e.target.value)}
                  className={`${numInput} border-amber-300`}
                />
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={addNew}
                  disabled={!newValid || savingId === "new"}
                  className="text-xs px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {savingId === "new" ? "추가 중…" : "추가"}
                </button>
              </td>
            </tr>

            {/* Existing draws */}
            {items.map((d) => {
              const row = rows[d.draw_no];
              if (!row) return null;
              return (
                <tr key={d.draw_no} className="border-t">
                  <td className="px-3 py-2 font-medium tabular-nums">{d.draw_no}</td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={row.draw_date}
                      onChange={(e) => setField(d.draw_no, { draw_date: e.target.value })}
                      className="border rounded px-1 py-1 text-sm"
                    />
                  </td>
                  {row.numbers.map((n, i) => (
                    <td key={i} className="px-1 py-2">
                      <input
                        type="number"
                        min={1}
                        max={45}
                        value={n}
                        onChange={(e) => setNum(d.draw_no, i, e.target.value)}
                        className={numInput}
                      />
                    </td>
                  ))}
                  <td className="px-1 py-2">
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={row.bonus}
                      onChange={(e) => setField(d.draw_no, { bonus: e.target.value })}
                      className={`${numInput} border-amber-300`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => save(d.draw_no, row)}
                      disabled={savingId === d.draw_no}
                      className="text-xs px-3 py-1.5 rounded border hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
                    >
                      {savingId === d.draw_no ? "저장 중…" : "저장"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {status?.ok && <p className="text-xs text-green-600">{status.ok}</p>}
      {status?.err && <p className="text-xs text-red-600">{status.err}</p>}

      {total > PER_PAGE && (
        <Pagination page={page} perPage={PER_PAGE} total={total} onChange={setPage} />
      )}
    </section>
  );
}
