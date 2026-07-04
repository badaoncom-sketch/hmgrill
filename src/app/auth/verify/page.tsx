import { MailCheck } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto grid max-w-xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="VERIFY"
        title="이메일 인증"
        description="실제 구현에서는 토큰 검증 후 사용자 인증 상태를 저장합니다."
      />
      <Card>
        <CardContent>
          <MailCheck className="text-emerald-700" size={32} aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-neutral-950">
            인증 요청이 접수되었습니다
          </h2>
          <p className="mt-3 break-all text-sm leading-6 text-neutral-600">
            토큰: {token ?? "토큰 없음"}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
