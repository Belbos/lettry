"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { usePresetStore, type Preset } from "@/lib/store/presetStore";

export default function PresetsPage() {
  const presets = usePresetStore((s) => s.presets);
  const add = usePresetStore((s) => s.add);
  const update = usePresetStore((s) => s.update);
  const remove = usePresetStore((s) => s.remove);
  const setDefault = usePresetStore((s) => s.setDefault);

  const snapshot = useSettingsStore((s) => s.snapshot);
  const applySnapshot = useSettingsStore((s) => s.applySnapshot);

  const [newName, setNewName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleSaveCurrent() {
    if (!newName.trim()) return;
    add(newName.trim(), snapshot());
    setNewName("");
  }

  function handleOverwrite(p: Preset) {
    update(p.id, p.name, snapshot());
  }

  function handleLoad(p: Preset) {
    applySnapshot(p.config);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">프리셋 관리</h1>
        <p className="text-sm text-slate-600 mt-1">
          현재 설정을 이름 붙여 저장하고 언제든 다시 불러올 수 있습니다. (로컬 저장)
        </p>
      </div>

      <section className="bg-white border rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold text-sm">현재 설정을 새 프리셋으로 저장</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="예: 균형형, Hot 중심, Cold 중심"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            onClick={handleSaveCurrent}
            disabled={!newName.trim()}
            className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            저장
          </button>
        </div>
        <p className="text-xs text-slate-500">
          현재{" "}
          <Link href="/settings" className="underline underline-offset-2">
            설정 화면
          </Link>
          의 값들이 그대로 저장됩니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm">저장된 프리셋 ({presets.length})</h2>
        {presets.length === 0 ? (
          <div className="text-sm text-slate-500 bg-white border rounded-2xl p-8 text-center">
            아직 저장된 프리셋이 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {presets.map((p) => (
              <li
                key={p.id}
                className="bg-white border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{p.name}</span>
                    {p.isDefault && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        기본
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    순서: {p.config.stepOrder.join(" → ")} · Hot{" "}
                    {p.config.hot.count} · Cold {p.config.cold.count} · Random{" "}
                    {p.config.random.count} · Weighted{" "}
                    {p.config.weighted_random.count}
                  </div>
                </div>
                <div className="flex gap-1.5 text-xs">
                  <button
                    onClick={() => handleLoad(p)}
                    className="px-2.5 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800"
                  >
                    불러오기
                  </button>
                  <button
                    onClick={() => handleOverwrite(p)}
                    className="px-2.5 py-1.5 rounded border hover:bg-slate-50"
                  >
                    현재값으로 덮어쓰기
                  </button>
                  {!p.isDefault && (
                    <button
                      onClick={() => setDefault(p.id)}
                      className="px-2.5 py-1.5 rounded border hover:bg-slate-50"
                    >
                      기본 지정
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (pendingDeleteId === p.id) {
                        remove(p.id);
                        setPendingDeleteId(null);
                      } else {
                        setPendingDeleteId(p.id);
                        setTimeout(
                          () =>
                            setPendingDeleteId((id) => (id === p.id ? null : id)),
                          3000,
                        );
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded border ${
                      pendingDeleteId === p.id
                        ? "bg-red-600 text-white border-red-600"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {pendingDeleteId === p.id ? "다시 클릭" : "삭제"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
