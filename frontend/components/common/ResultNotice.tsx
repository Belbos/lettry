import { RESULT_DISCLAIMER } from "@/lib/copy";

/** 번호 조합 결과 화면에 인라인으로 노출되는 안내. */
export function ResultNotice() {
  return (
    <p className="text-[11px] leading-relaxed text-slate-500 text-center max-w-md mx-auto">
      {RESULT_DISCLAIMER}
    </p>
  );
}
