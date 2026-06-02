import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Disclaimer } from "@/components/common/Disclaimer";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { SITE_BRAND, SITE_BRAND_SUBLABEL, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/copy";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
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
              🎲 {SITE_BRAND}
              <span className="ml-2 text-xs text-slate-500 font-normal">
                {SITE_BRAND_SUBLABEL}
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <nav className="flex gap-4 text-sm text-slate-600">
                <Link href="/" className="hover:text-slate-900">추천</Link>
                <Link href="/settings" className="hover:text-slate-900">설정</Link>
                <Link href="/statistics" className="hover:text-slate-900">통계</Link>
                <Link href="/draws" className="hover:text-slate-900">당첨번호</Link>
                <Link href="/presets" className="hover:text-slate-900">프리셋</Link>
                <Link href="/history" className="hover:text-slate-900">이력</Link>
              </nav>
              <AuthStatus />
            </div>
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
