import { SectionHeading } from "@/components/section-heading";
import { StaffScanner } from "@/components/staff/staff-scanner";
import { Card, CardContent } from "@/components/ui/card";
import { requireStaffAccess } from "@/lib/auth/access";
import { couponEventSelect, mapCouponEvent } from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StaffPage() {
  const { user, canAccess } = await requireStaffAccess();
  const { data: rows } = canAccess
    ? await createAdminClient()
        .from("coupon_events")
        .select(couponEventSelect)
        .eq("actor_id", user.id)
        .in("event_type", ["coupon_used", "coupon_expired"])
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] };
  const recentEvents = (rows ?? []).map(mapCouponEvent);

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="STAFF MODE"
        title="직원모드"
        description="계산대 태블릿 크롬 브라우저에서 QR 스캔, 쿠폰 조회, 사용완료 처리를 수행합니다."
      />
      {canAccess ? (
        <>
          <StaffScanner />
          <Card>
            <CardContent>
              <h2 className="font-bold text-neutral-950">최근 처리 내역</h2>
              <div className="mt-4 grid gap-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-neutral-200 p-3"
                  >
                    <p className="text-sm font-semibold text-neutral-950">
                      {event.eventType === "coupon_used"
                        ? "사용완료"
                        : "기간만료"}{" "}
                      처리
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {new Date(event.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                ))}
                {recentEvents.length === 0 ? (
                  <p className="text-sm font-semibold text-neutral-600">
                    최근 처리한 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-900">
          직원 또는 관리자 권한과 이메일 인증이 필요합니다.
        </div>
      )}
    </main>
  );
}
