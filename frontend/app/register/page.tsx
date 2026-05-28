"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, checkUsername } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus("invalid");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    try {
      const res = await checkUsername(value);
      setUsernameStatus(res.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }
    const timer = setTimeout(() => checkUsernameAvailability(username), 400);
    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  const emailValid =
    !email || /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
  const passwordsMatch = !passwordConfirm || password === passwordConfirm;
  const passwordLong = !password || password.length >= 6;

  const canSubmit =
    username.length >= 3 &&
    password.length >= 6 &&
    password === passwordConfirm &&
    emailValid &&
    email.length > 0 &&
    usernameStatus === "available" &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        username,
        password,
        password_confirm: passwordConfirm,
        email,
      });
      router.push("/login?registered=1");
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { detail?: string };
        setError(body?.detail ?? "회원가입에 실패했습니다");
      } else {
        setError("서버에 연결할 수 없습니다");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            아이디
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="영문, 숫자, 밑줄 (3~30자)"
            maxLength={30}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {usernameStatus === "checking" && (
            <p className="text-xs text-slate-500 mt-1">확인 중…</p>
          )}
          {usernameStatus === "available" && (
            <p className="text-xs text-green-600 mt-1">사용 가능한 아이디입니다</p>
          )}
          {usernameStatus === "taken" && (
            <p className="text-xs text-red-600 mt-1">이미 사용 중인 아이디입니다</p>
          )}
          {usernameStatus === "invalid" && username.length > 0 && (
            <p className="text-xs text-red-600 mt-1">
              영문, 숫자, 밑줄(_)만 사용 가능 (3자 이상)
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!passwordLong && (
            <p className="text-xs text-red-600 mt-1">비밀번호는 6자 이상이어야 합니다</p>
          )}
        </div>

        {/* Password Confirm */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!passwordsMatch && (
            <p className="text-xs text-red-600 mt-1">비밀번호가 일치하지 않습니다</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="example@email.com"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!emailValid && (
            <p className="text-xs text-red-600 mt-1">올바른 이메일 형식이 아닙니다</p>
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
          {loading ? "처리 중…" : "회원가입"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
