"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPassword({ username });
      setMessage(res.message);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { detail?: string };
        setError(body?.detail ?? "요청에 실패했습니다");
      } else {
        setError("서버에 연결할 수 없습니다");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">비밀번호 찾기</h1>
      <p className="text-sm text-slate-600 mb-6">
        아이디를 입력하면 등록된 이메일로 임시 비밀번호를 보내드립니다.
      </p>

      {message ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-3 text-sm space-y-3">
          <p>{message}</p>
          <p className="text-slate-600">
            메일로 받은 임시 비밀번호로{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
            한 뒤 새 비밀번호로 변경해 주세요.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              아이디
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="가입한 아이디를 입력하세요"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={username.length === 0 || loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "전송 중…" : "임시 비밀번호 받기"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
