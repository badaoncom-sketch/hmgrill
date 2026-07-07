import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { LoginForm, ResendVerificationForm } from "@/components/auth/auth-forms";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "로그인",
  description: "회원 인증 후 방문 혜택과 마이페이지를 이용할 수 있습니다.",
};

export default function LoginPage() {
  return (
    <main className="hm-page-shell hm-page-shell-narrow">
      <div>
        <p className="hm-eyebrow">Member</p>
        <h1 className="hm-section-title mt-4">로그인</h1>
        <p className="hm-body mt-4 text-[var(--hm-subtext)]">
          회원 인증 후 방문 혜택과 마이페이지를 이용할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardContent>
          <LoginForm />
          <div className="mt-5 text-right text-sm">
            <Link
              href="/auth/password-reset"
              className="hm-link-focus rounded-sm font-semibold text-[var(--hm-subtext)] transition hover:text-[var(--hm-primary)]"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <details className="group mt-6 border-t border-[var(--hm-divider)] pt-4">
            <summary className="hm-link-focus flex cursor-pointer list-none items-center justify-between gap-3 rounded-[10px] text-sm font-semibold text-[var(--hm-subtext)] transition hover:text-[var(--hm-primary)] [&::-webkit-details-marker]:hidden">
              인증 메일을 받지 못하셨나요?
              <ChevronDown
                size={16}
                className="shrink-0 transition group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-4">
              <ResendVerificationForm />
            </div>
          </details>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-[var(--hm-subtext)]">
        아직 회원이 아니신가요?{" "}
        <Link
          href="/signup"
          className="hm-link-focus rounded-sm font-bold text-[var(--hm-primary)] transition hover:text-[var(--hm-accent-gold)]"
        >
          회원가입
        </Link>
      </p>
    </main>
  );
}
