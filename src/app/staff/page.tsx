import { SectionHeading } from "@/components/section-heading";
import { StaffScanner } from "@/components/staff/staff-scanner";

export default function StaffPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="STAFF MODE"
        title="직원모드"
        description="계산대 태블릿 크롬 브라우저에서 QR 스캔, 쿠폰 조회, 사용완료 처리를 수행합니다."
      />
      <StaffScanner />
    </main>
  );
}
