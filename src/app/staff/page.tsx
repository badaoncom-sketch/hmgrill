import { SectionHeading } from "@/components/section-heading";
import { StaffScanner } from "@/components/staff/staff-scanner";
import { requireStaffAccess } from "@/lib/auth/access";

export default async function StaffPage() {
  const { canAccess } = await requireStaffAccess();

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="STAFF MODE"
        title="직원모드"
        description="계산대 태블릿 크롬 브라우저에서 QR 스캔, 쿠폰 조회, 사용완료 처리를 수행합니다."
      />
      {canAccess ? (
        <StaffScanner />
      ) : (
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-900">
          직원 또는 관리자 권한과 이메일 인증이 필요합니다.
        </div>
      )}
    </main>
  );
}
