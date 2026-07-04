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
    <main className="mx-auto grid max-w-xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="VERIFY"
        title="이메일 인증"
        description="실제 구현에서는 토큰 검증 후 사용자 인증 상태를 저장합니다."
      />
      <Card>
        <CardContent>
          <MailCheck
            className={result.ok ? "text-emerald-700" : "text-red-700"}
            size={32}
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-bold text-neutral-950">
            {result.ok ? "인증 완료" : "인증 실패"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
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
