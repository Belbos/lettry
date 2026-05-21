"use client";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  ariaLabel?: string;
};

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
  ariaLabel,
}: Props) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : ""}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isNaN(n)) return;
        onChange(n);
      }}
      className={`w-20 rounded-md border border-slate-300 px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
    />
  );
}
