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
    <main className="hm-page-shell hm-page-shell-staff">
      <SectionHeading
        eyebrow="STAFF MODE"
        title="직원모드"
        description="매장 태블릿에서 QR 스캔, 혜택 조회, 사용완료 처리를 빠르게 수행합니다."
      />
      {canAccess ? (
        <>
          <StaffScanner />
          <Card>
            <CardContent>
              <h2 className="font-bold text-[var(--hm-text)]">최근 처리 내역</h2>
              <div className="mt-4 grid gap-3">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-[var(--hm-border)] p-3"
                  >
                    <p className="text-sm font-semibold text-[var(--hm-text)]">
                      {event.eventType === "coupon_used"
                        ? "사용완료"
                        : "기간만료"}{" "}
                      처리
                    </p>
                    <p className="mt-1 text-sm text-[var(--hm-subtext)]">
                      {new Date(event.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                ))}
                {recentEvents.length === 0 ? (
                  <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                    최근 처리한 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)] p-5 text-sm font-semibold text-[var(--hm-subtext)]">
          직원 또는 관리자 권한과 이메일 인증이 필요합니다.
        </div>
      )}
    </main>
  );
}
