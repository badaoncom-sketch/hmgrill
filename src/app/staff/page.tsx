import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { StaffScanner } from "@/components/staff/staff-scanner";
import { createClient } from "@/lib/supabase/server";

export default async function StaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,email_verified")
    .eq("id", user.id)
    .maybeSingle();

  const canUseStaffMode =
    profile?.email_verified && (profile.role === "staff" || profile.role === "admin");

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="STAFF MODE"
        title="직원모드"
        description="계산대 태블릿 크롬 브라우저에서 QR 스캔, 쿠폰 조회, 사용완료 처리를 수행합니다."
      />
      {canUseStaffMode ? (
        <StaffScanner />
      ) : (
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-900">
          직원 또는 관리자 권한과 이메일 인증이 필요합니다.
        </div>
      )}
    </main>
  );
}
