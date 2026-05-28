"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/lib/store/settingsStore";
import { usePresetStore } from "@/lib/store/presetStore";
import { useAuthStore } from "@/lib/store/authStore";
import { LoginRequired } from "@/components/auth/LoginRequired";
import type { Preset } from "@/lib/types/preset";

export default function PresetsPage() {
  const user = useAuthStore((s) => s.user);
  const presets = usePresetStore((s) => s.presets);
  const loaded = usePresetStore((s) => s.loaded);
  const load = usePresetStore((s) => s.load);
  const add = usePresetStore((s) => s.add);
  const update = usePresetStore((s) => s.update);
  const remove = usePresetStore((s) => s.remove);
  const setDefault = usePresetStore((s) => s.setDefault);
  const reset = usePresetStore((s) => s.reset);

  const snapshot = useSettingsStore((s) => s.snapshot);
  const applySnapshot = useSettingsStore((s) => s.applySnapshot);

  const [newName, setNewName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      load().catch(() => setError("프리셋을 불러오지 못했습니다"));
    } else {
      reset();
    }
  }, [user, load, reset]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch {
      setError("요청을 처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">프리셋 관리</h1>
          <p className="text-sm text-slate-600 mt-1">
            로그인하면 설정을 프리셋으로 저장하고 계정에 보관할 수 있습니다.
          </p>
        </div>
        <LoginRequired message="프리셋 저장은 로그인 후 이용할 수 있습니다." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">프리셋 관리</h1>
        <p className="text-sm text-slate-600 mt-1">
          현재 설정을 이름 붙여 저장하고 언제든 다시 불러올 수 있습니다. (계정에 저장)
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
            onClick={() =>
              run(async () => {
                if (!newName.trim()) return;
                await add(newName.trim(), snapshot());
                setNewName("");
              })
            }
            disabled={!newName.trim() || busy}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-sm">저장된 프리셋 ({presets.length})</h2>
        {!loaded ? (
          <div className="text-sm text-slate-500 bg-white border rounded-2xl p-8 text-center">
            불러오는 중…
          </div>
        ) : presets.length === 0 ? (
          <div className="text-sm text-slate-500 bg-white border rounded-2xl p-8 text-center">
            아직 저장된 프리셋이 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {presets.map((p: Preset) => (
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
                    onClick={() => applySnapshot(p.config)}
                    className="px-2.5 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800"
                  >
                    불러오기
                  </button>
                  <button
                    onClick={() => run(() => update(p.id, p.name, snapshot()))}
                    disabled={busy}
                    className="px-2.5 py-1.5 rounded border hover:bg-slate-50 disabled:opacity-50"
                  >
                    현재값으로 덮어쓰기
                  </button>
                  {!p.isDefault && (
                    <button
                      onClick={() => run(() => setDefault(p.id))}
                      disabled={busy}
                      className="px-2.5 py-1.5 rounded border hover:bg-slate-50 disabled:opacity-50"
                    >
                      기본 지정
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (pendingDeleteId === p.id) {
                        setPendingDeleteId(null);
                        run(() => remove(p.id));
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
