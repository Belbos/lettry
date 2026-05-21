import { LottoBall } from "./LottoBall";

type Props = { numbers: number[]; size?: "sm" | "md" | "lg" };

export function LottoNumberSet({ numbers, size = "lg" }: Props) {
  return (
    <div className="flex gap-3 justify-center items-center">
      {numbers.map((n) => (
        <LottoBall key={n} value={n} size={size} />
      ))}
    </div>
  );
}
