"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, user, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && (!token || !user)) router.replace("/login");
  }, [mounted, token, user, router]);

  if (!mounted || !token || !user) return null;

  const passwordLong = !newPassword || newPassword.length >= 8;
  const passwordsMatch = !newPasswordConfirm || newPassword === newPasswordConfirm;
  const canSubmit =
    tempPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === newPasswordConfirm &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const updated = await resetPassword(
        {
          temp_password: tempPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        },
        token!,
      );
      setAuth(token!, updated);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { detail?: unknown };
        const d = body?.detail;
        if (typeof d === "string") setError(d);
        else if (Array.isArray(d) && d[0] && typeof d[0] === "object" && "msg" in d[0])
          setError(String((d[0] as { msg: unknown }).msg));
        else setError("비밀번호 변경에 실패했습니다");
      } else {
        setError("서버에 연결할 수 없습니다");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">비밀번호 변경</h1>
      <p className="text-sm text-slate-600 mb-6">
        {user.must_reset_password
          ? "임시 비밀번호로 로그인하셨습니다. 새 비밀번호로 변경해 주세요."
          : "임시 비밀번호와 새 비밀번호를 입력해 변경합니다."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            임시 비밀번호
          </label>
          <input
            type="password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="이메일로 받은 임시 비밀번호"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            새 비밀번호
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8자 이상"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!passwordLong && (
            <p className="text-xs text-red-600 mt-1">비밀번호는 8자 이상이어야 합니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!passwordsMatch && (
            <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
