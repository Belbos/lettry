import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Disclaimer } from "@/components/common/Disclaimer";

export const metadata: Metadata = {
  title: "로또 번호 추천 (엔터테인먼트)",
  description: "통계 기반 로또 번호 조합 추천 서비스 (당첨 보장 아님)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-slate-900">
              🎲 Lotto Advisor
              <span className="ml-2 text-xs text-slate-500 font-normal">
                엔터테인먼트용
              </span>
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">추천</Link>
              <Link href="/settings" className="hover:text-slate-900">설정</Link>
              <Link href="/statistics" className="hover:text-slate-900">통계</Link>
              <Link href="/presets" className="hover:text-slate-900">프리셋</Link>
              <Link href="/history" className="hover:text-slate-900">이력</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
          {children}
        </main>

        <footer className="border-t bg-white py-6">
          <Disclaimer />
        </footer>
      </body>
    </html>
  );
}
