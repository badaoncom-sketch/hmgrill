import { MailCheck, Ticket } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MyPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="MY PAGE"
        title="마이페이지"
        description="이메일 인증 상태와 쿠폰 보유 현황을 확인합니다."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent>
            <MailCheck className="text-emerald-700" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-neutral-950">
              이메일 인증 상태
            </h2>
            <Badge tone="green" className="mt-3">
              인증 완료
            </Badge>
            <p className="mt-3 text-sm text-neutral-600">
              실제 구현에서는 Supabase Auth와 사용자 테이블의 인증 상태를 함께
              확인합니다.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Ticket className="text-red-700" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-neutral-950">
              내 쿠폰 관리
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              다운로드한 쿠폰과 사용내역을 확인할 수 있습니다.
            </p>
            <ButtonLink href="/coupons/my" className="mt-5">
              내 쿠폰 보기
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
