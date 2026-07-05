import { MailCheck } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verifyEmailToken } from "@/lib/auth/verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailToken(token)
    : { ok: false, message: "인증 토큰이 없습니다." };

  return (
    <main className="hm-page-shell hm-page-shell-narrow">
      <SectionHeading
        eyebrow="VERIFY"
        title="이메일 인증"
        description="인증이 완료되면 회원 혜택과 쿠폰 화면을 이용할 수 있습니다."
      />
      <Card>
        <CardContent>
          <MailCheck
            className={result.ok ? "text-emerald-700" : "text-red-700"}
            size={32}
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-bold text-[var(--hm-text)]">
            {result.ok ? "인증 완료" : "인증 실패"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--hm-subtext)]">
            {result.message}
          </p>
          <ButtonLink href="/login" className="mt-5">
            로그인으로 이동
          </ButtonLink>
        </CardContent>
      </Card>
    </main>
  );
}
