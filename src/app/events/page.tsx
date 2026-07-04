import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="EVENT"
        title="이벤트"
        description="매장 이벤트와 쿠폰 캠페인을 노출하는 영역입니다."
      />
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold text-neutral-950">
            신규 회원 쿠폰 이벤트
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            이메일 인증을 완료한 회원에게 다운로드 가능한 쿠폰을 제공합니다.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
