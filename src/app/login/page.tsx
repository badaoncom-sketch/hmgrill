import Link from "next/link";
import { LoginForm, ResendVerificationForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="hm-page-shell hm-page-shell-narrow">
      <SectionHeading
        eyebrow="MEMBER"
        title="로그인"
        description="회원 인증 후 방문 혜택과 마이페이지를 이용할 수 있습니다."
      />
      <Card>
        <CardContent>
          <LoginForm />
          <div className="mt-4 flex justify-between text-sm text-[var(--hm-subtext)]">
            <Link href="/signup" className="hm-link-focus rounded-sm hover:text-[var(--hm-text)]">
              회원가입
            </Link>
            <Link href="/auth/password-reset" className="hm-link-focus rounded-sm hover:text-[var(--hm-text)]">
              비밀번호 찾기
            </Link>
          </div>
          <div className="mt-6 border-t border-[var(--hm-divider)] pt-6">
            <ResendVerificationForm />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
