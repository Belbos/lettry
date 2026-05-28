"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { ApiError } from "@/lib/api/client";
import { importCsv, listUsers, setAdminFlag } from "@/lib/api/admin";
import { AdminDrawsSection } from "@/components/admin/AdminDrawsSection";
import type { AdminUser } from "@/lib/types/admin";

function errMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const body = e.body as { detail?: unknown } | undefined;
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d[0]?.msg) return String(d[0].msg);
    return e.message;
  }
  return e instanceof Error ? e.message : String(e);
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && (!user || !user.is_admin)) router.replace("/");
  }, [mounted, user, router]);

  if (!mounted || !user || !user.is_admin) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold">관리자 대시보드</h1>
        <p className="text-sm text-slate-600 mt-1">
          당첨번호 데이터와 사용자를 관리합니다.
        </p>
      </div>
      <CsvUploadSection />
      <AdminDrawsSection />
      <UsersSection currentUserId={user.id} />
    </div>
  );
}

function CsvUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await importCsv(file);
      setMsg(`${res.inserted}건 추가됨 (총 ${res.total}회차)`);
      setFile(null);
    } catch (e) {
      setErr(errMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white border rounded-2xl p-5 space-y-3">
      <h2 className="font-semibold text-sm">CSV 대량 업로드</h2>
      <p className="text-xs text-slate-500">
        회차별 당첨번호 CSV 파일을 업로드합니다. 이미 존재하는 회차는 건너뜁니다. (최대 5MB)
      </p>
      <div className="flex gap-2 items-center">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          disabled={!file || busy}
          className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? "업로드 중…" : "업로드"}
        </button>
      </div>
      {msg && <p className="text-xs text-green-600">{msg}</p>}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </section>
  );
}

function UsersSection({ currentUserId }: { currentUserId: number }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    try {
      setUsers(await listUsers());
      setLoaded(true);
    } catch (e) {
      setErr(errMessage(e));
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function toggle(u: AdminUser) {
    setErr(null);
    try {
      await setAdminFlag(u.id, !u.is_admin);
      await reload();
    } catch (e) {
      setErr(errMessage(e));
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-sm">사용자 목록 ({users.length})</h2>
      {err && <p className="text-xs text-red-600">{err}</p>}
      {!loaded ? (
        <div className="text-sm text-slate-500 bg-white border rounded-2xl p-6 text-center">
          불러오는 중…
        </div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs">
              <tr>
                <th className="text-left px-4 py-2">아이디</th>
                <th className="text-left px-4 py-2">이메일</th>
                <th className="text-left px-4 py-2">가입일</th>
                <th className="text-left px-4 py-2">권한</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{u.username}</td>
                  <td className="px-4 py-2 text-slate-600">{u.email}</td>
                  <td className="px-4 py-2 text-slate-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-2">
                    {u.is_admin ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        관리자
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">일반</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {u.id === currentUserId ? (
                      <span className="text-xs text-slate-400">본인</span>
                    ) : (
                      <button
                        onClick={() => toggle(u)}
                        className="text-xs px-2.5 py-1 rounded border hover:bg-slate-50"
                      >
                        {u.is_admin ? "관리자 해제" : "관리자 지정"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
