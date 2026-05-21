"use client";

import { useState } from "react";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { ColdNumberConfig } from "@/components/settings/ColdNumberConfig";
import { FilterConfig } from "@/components/settings/FilterConfig";
import { HotNumberConfig } from "@/components/settings/HotNumberConfig";
import { RandomConfig } from "@/components/settings/RandomConfig";
import { StepOrderDnD } from "@/components/settings/StepOrderDnD";
import { WeightedRandomConfig } from "@/components/settings/WeightedRandomConfig";

export default function SettingsPage() {
  const reset = useSettingsStore((s) => s.resetToDefault);
  const [resetConfirm, setResetConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold">알고리즘 설정</h1>
          <p className="text-sm text-slate-600 mt-1">
            블록별 옵션을 조정하고 적용 순서를 변경하세요. 변경사항은 자동 저장됩니다.
          </p>
        </div>
        <button
          onClick={() => {
            if (resetConfirm) {
              reset();
              setResetConfirm(false);
            } else {
              setResetConfirm(true);
              setTimeout(() => setResetConfirm(false), 3000);
            }
          }}
          className="text-xs text-slate-600 hover:text-red-600 underline underline-offset-2"
        >
          {resetConfirm ? "한 번 더 클릭하면 초기화" : "기본값으로 초기화"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <HotNumberConfig />
          <ColdNumberConfig />
          <RandomConfig />
          <WeightedRandomConfig />
        </div>
        <div className="space-y-4">
          <StepOrderDnD />
          <FilterConfig />
        </div>
      </div>
    </div>
  );
}
