import type { Metadata } from "next";
import {
  StaffScanner,
  type GuestIssueOption,
  type StaffRecentEvent,
  type TodayStats,
} from "@/components/staff/staff-scanner";
import { Container } from "@/components/ui/layout";
import { requireStaffAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { maskName, maskPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "QR 쿠폰 스캔",
  description: "계산대에서 QR 쿠폰을 스캔하고 사용완료 처리합니다.",
};

const staffEventSelect = [
  "id",
  "event_type",
  "created_at",
  "actor_profile:profiles!coupon_events_actor_id_fkey(name)",
  "member_coupon:member_coupons!coupon_events_member_coupon_id_fkey(coupon_number,coupon_issues(name,amount),member_profile:profiles!member_coupons_member_id_fkey(name,phone))",
].join(",");

type StaffEventCoupon = {
  coupon_number: string;
  coupon_issues:
    | { name: string; amount: number }
    | { name: string; amount: number }[]
    | null;
  member_profile:
    | { name: string | null; phone: string | null }
    | { name: string | null; phone: string | null }[]
    | null;
};

type StaffEventRow = {
  id: string;
  event_type: string;
  created_at: string;
  actor_profile: { name: string | null } | { name: string | null }[] | null;
  member_coupon: StaffEventCoupon | StaffEventCoupon[] | null;
};

type TodayUsedRow = {
  member_coupon: {
    coupon_issues: { amount: number } | { amount: number }[] | null;
  } | {
    coupon_issues: { amount: number } | { amount: number }[] | null;
  }[] | null;
};

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapStaffEvent(row: unknown): StaffRecentEvent {
  const item = row as StaffEventRow;
  const memberCoupon = firstOf(item.member_coupon);
  const issue = firstOf(memberCoupon?.coupon_issues);
  const memberProfile = firstOf(memberCoupon?.member_profile);
  const actorProfile = firstOf(item.actor_profile);

  return {
    id: item.id,
    eventType: item.event_type,
    createdAt: item.created_at,
    couponNumber: memberCoupon?.coupon_number ?? null,
    couponName: issue?.name ?? null,
    amount: issue?.amount ?? null,
    // 상시 노출 화면이므로 개인정보는 서버에서 마스킹한 값만 내려보낸다.
    memberNameMasked: maskName(memberProfile?.name),
    memberPhoneMasked: maskPhone(memberProfile?.phone),
    staffName: actorProfile?.name ?? null,
  };
}

export default async function QrCouponPage() {
  const { canAccess } = await requireStaffAccess();

  let recentEvents: StaffRecentEvent[] = [];
  let today: TodayStats = { usedCount: 0, discountTotal: 0 };
  let guestIssues: GuestIssueOption[] = [];

  if (canAccess) {
    const admin = createAdminClient();
    const kstDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
    }).format(new Date());

    const [{ data: eventRows }, { data: todayRows }, { data: guestIssueRows }] = await Promise.all([
      // 공용 계산대 태블릿이므로 직원 구분 없이 매장 전체 내역을 보여준다.
      admin
        .from("coupon_events")
        .select(staffEventSelect)
        .in("event_type", ["coupon_used", "coupon_expired"])
        .order("created_at", { ascending: false })
        .limit(8),
      admin
        .from("coupon_events")
        .select(
          "member_coupon:member_coupons!coupon_events_member_coupon_id_fkey(coupon_issues(amount))",
        )
        .eq("event_type", "coupon_used")
        .gte("created_at", `${kstDay}T00:00:00+09:00`),
      admin
        .from("coupon_issues")
        .select("id,name,amount,quantity,downloaded_count")
        .eq("distribution", "guest")
        .eq("status", "issuing")
        .order("created_at", { ascending: false }),
    ]);

    recentEvents = (eventRows ?? []).map(mapStaffEvent);
    guestIssues = ((guestIssueRows ?? []) as {
      id: string; name: string; amount: number; quantity: number; downloaded_count: number;
    }[])
      .filter((row) => row.quantity - row.downloaded_count > 0)
      .map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        remaining: row.quantity - row.downloaded_count,
      }));
    today = {
      usedCount: (todayRows ?? []).length,
      discountTotal: (todayRows ?? []).reduce((sum, row) => {
        const issue = firstOf(firstOf((row as TodayUsedRow).member_coupon)?.coupon_issues);
        return sum + (issue?.amount ?? 0);
      }, 0),
    };
  }

  return (
    <main className="hm-page-main">
      <Container>
        <div>
          <p className="hm-eyebrow">QR Coupon</p>
          <h1 className="hm-section-title mt-5">QR 쿠폰 스캔</h1>
          <p className="hm-body mt-5 text-[var(--hm-subtext)]">
            계산대 태블릿 전용 화면입니다. QR을 스캔하면 자동으로 조회되며,
            손님과 함께 결과를 확인할 수 있습니다.
          </p>
        </div>

        {canAccess ? (
          <div className="mt-10">
            <StaffScanner
              recentEvents={recentEvents}
              today={today}
              guestIssues={guestIssues}
            />
          </div>
        ) : (
          <div className="mt-10 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              직원 또는 관리자 권한과 이메일 인증이 필요합니다.
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
