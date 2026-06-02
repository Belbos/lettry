import Link from "next/link";

export function LoginRequired({ message }: { message: string }) {
  return (
    <div className="bg-white border rounded-2xl p-8 text-center space-y-4">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex gap-2 justify-center">
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          로그인
        </Link>
        <Link
          href="/register/terms"
          className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
