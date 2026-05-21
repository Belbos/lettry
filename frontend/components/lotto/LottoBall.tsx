type Props = { value: number; size?: "sm" | "md" | "lg" };

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-14 h-14 text-xl",
};

function colorFor(n: number): string {
  if (n <= 10) return "bg-lotto-yellow text-slate-900";
  if (n <= 20) return "bg-lotto-blue text-white";
  if (n <= 30) return "bg-lotto-red text-white";
  if (n <= 40) return "bg-lotto-gray text-white";
  return "bg-lotto-green text-white";
}

export function LottoBall({ value, size = "md" }: Props) {
  return (
    <div
      className={`rounded-full font-bold flex items-center justify-center shadow-sm ${sizes[size]} ${colorFor(value)}`}
      aria-label={`lotto number ${value}`}
    >
      {value}
    </div>
  );
}
