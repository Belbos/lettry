import {
  AGE_NOTICE,
  NOT_OFFICIAL_NOTICE,
  SERVICE_DISCLAIMER,
} from "@/lib/copy";

/** 푸터에 사이트 전체적으로 표시되는 면책·고지. */
export function Disclaimer() {
  return (
    <div className="max-w-3xl mx-auto px-4 text-xs leading-relaxed text-slate-500 text-center space-y-2">
      <p>{SERVICE_DISCLAIMER}</p>
      <p>{NOT_OFFICIAL_NOTICE}</p>
      <p>{AGE_NOTICE}</p>
    </div>
  );
}
