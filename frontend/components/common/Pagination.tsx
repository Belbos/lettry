"use client";

type Props = {
  page: number; // zero-based
  perPage: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, perPage, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <button
        onClick={() => canPrev && onChange(page - 1)}
        disabled={!canPrev}
        className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 disabled:opacity-40"
      >
        이전
      </button>
      <span className="text-slate-600 tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => canNext && onChange(page + 1)}
        disabled={!canNext}
        className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}
