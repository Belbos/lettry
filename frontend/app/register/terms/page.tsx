"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PRIVACY_POLICY,
  TERMS_AGREED_KEY,
  TERMS_OF_SERVICE,
} from "@/lib/legal";

function DocBox({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-800 mb-1">{title}</h2>
      <div className="h-40 overflow-y-auto border rounded-lg bg-slate-50 p-3 text-xs text-slate-600 whitespace-pre-line leading-relaxed">
        {body}
      </div>
    </div>
  );
}

export default function TermsAgreementPage() {
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const allAgreed = agreeTerms && agreePrivacy;

  function handleContinue() {
    if (!allAgreed) return;
    sessionStorage.setItem(TERMS_AGREED_KEY, "1");
    router.push("/register");
  }

  function toggleAll(checked: boolean) {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">약관 동의</h1>
      <p className="text-sm text-slate-600 mb-6">
        회원가입을 위해 아래 약관에 동의해 주세요.
      </p>

      <div className="space-y-5">
        <DocBox title="이용약관 (필수)" body={TERMS_OF_SERVICE} />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="rounded"
          />
          이용약관에 동의합니다
        </label>

        <DocBox title="개인정보 처리방침 (필수)" body={PRIVACY_POLICY} />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={(e) => setAgreePrivacy(e.target.checked)}
            className="rounded"
          />
          개인정보 처리방침에 동의합니다
        </label>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <input
              type="checkbox"
              checked={allAgreed}
              onChange={(e) => toggleAll(e.target.checked)}
              className="rounded"
            />
            전체 동의
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!allAgreed}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          동의하고 계속하기
        </button>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
