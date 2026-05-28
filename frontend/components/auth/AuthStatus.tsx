"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { usePresetStore } from "@/lib/store/presetStore";
import { useHistoryStore } from "@/lib/store/historyStore";

export function AuthStatus() {
  const { user, logout } = useAuthStore();
  const resetPresets = usePresetStore((s) => s.reset);
  const resetHistory = useHistoryStore((s) => s.reset);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="flex gap-2 items-center">
        <Link
          href="/login"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          로그인
        </Link>
        <Link
          href="/register"
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
        >
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-center">
      {user.is_admin && (
        <Link
          href="/admin"
          className="text-sm text-amber-700 font-medium hover:text-amber-800"
        >
          관리자
        </Link>
      )}
      <span className="text-sm text-slate-700 font-medium">{user.username}</span>
      <button
        onClick={() => {
          logout();
          resetPresets();
          resetHistory();
          router.push("/");
        }}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        로그아웃
      </button>
    </div>
  );
}
