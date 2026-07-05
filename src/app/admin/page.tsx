import Link from "next/link";
import { BarChart3, TicketCheck, Users, UserRoundCog } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  couponEventSelect,
  couponIssueSelect,
  mapCouponEvent,
  mapCouponIssue,
} from "@/lib/coupons/db";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/members", label: "회원관리", icon: Users },
  { href: "/admin/staff", label: "직원관리", icon: UserRoundCog },
  { href: "/admin/coupons", label: "쿠폰관리", icon: BarChart3 },
  { href: "/admin/menu", label: "메뉴관리", icon: BarChart3 },
  { href: "/admin/events", label: "이벤트관리", icon: BarChart3 },
  { href: "/admin/notices", label: "공지사항관리", icon: BarChart3 },
  { href: "/admin/inquiries", label: "문의관리", icon: BarChart3 },
  { href: "/admin/banners", label: "배너관리", icon: BarChart3 },
  { href: "/admin/popups", label: "팝업관리", icon: BarChart3 },
];

export default async function AdminPage() {
  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    return (
      <main className="hm-page-shell">
        <SectionHeading
          eyebrow="ADMIN"
          title="관리자 대시보드"
          description="쿠폰 현황, 금액 통계, 회원과 직원 운영 메뉴를 확인합니다."
        />
        <Card>
          <CardContent>
              <p className="text-sm font-semibold text-[var(--hm-accent-gold)]">
                관리자 권한과 이메일 인증이 필요합니다.
              </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const admin = createAdminClient();
  const [{ data: rows }, { data: eventRows }] = await Promise.all([
    admin.from("coupon_issues").select(couponIssueSelect),
    admin
      .from("coupon_events")
      .select(couponEventSelect)
      .eq("event_type", "coupon_used")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const couponIssues = (rows ?? []).map(mapCouponIssue);
  const recentUseEvents = (eventRows ?? []).map(mapCouponEvent);
  const totalIssued = couponIssues.reduce((sum, item) => sum + item.quantity, 0);
  const totalDownloaded = couponIssues.reduce(
    (sum, item) => sum + item.downloadedCount,
    0,
  );
  const totalRemaining = couponIssues.reduce(
    (sum, item) => sum + Math.max(item.quantity - item.downloadedCount, 0),
    0,
  );
  const totalUsed = couponIssues.reduce((sum, item) => sum + item.usedCount, 0);
  const totalExpired = couponIssues.reduce(
    (sum, item) => sum + item.expiredCount,
    0,
  );
  const totalIssuedAmount = couponIssues.reduce(
    (sum, item) => sum + item.quantity * item.amount,
    0,
  );
  const totalUsedAmount = couponIssues.reduce(
    (sum, item) => sum + item.usedCount * item.amount,
    0,
  );
  const unusedDownloadedAmount = couponIssues.reduce(
    (sum, item) =>
      sum +
      Math.max(item.downloadedCount - item.usedCount - item.expiredCount, 0) *
        item.amount,
    0,
  );

  return (
    <main className="hm-page-shell">
      <SectionHeading
        eyebrow="ADMIN"
        title="관리자 대시보드"
        description="쿠폰 현황, 금액 통계, 회원과 직원 운영 메뉴를 확인합니다."
      />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">총 발행 수량</p>
            <p className="mt-2 text-3xl font-bold text-[var(--hm-text)]">
              {totalIssued}장
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">다운로드 수량</p>
            <p className="mt-2 text-3xl font-bold text-[var(--hm-text)]">
              {totalDownloaded}장
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">남은 수량</p>
            <p className="mt-2 text-3xl font-bold text-[var(--hm-text)]">
              {totalRemaining}장
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">사용 완료</p>
            <p className="mt-2 text-3xl font-bold text-[var(--hm-text)]">
              {totalUsed}장
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">기간 만료</p>
            <p className="mt-2 text-3xl font-bold text-[var(--hm-text)]">
              {totalExpired}장
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">총 발행 금액</p>
            <p className="mt-2 text-2xl font-bold text-[var(--hm-text)]">
              {formatCurrency(totalIssuedAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">총 사용 금액</p>
            <p className="mt-2 text-2xl font-bold text-[var(--hm-accent-gold)]">
              {formatCurrency(totalUsedAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--hm-subtext)]">미사용 다운로드 금액</p>
            <p className="mt-2 text-2xl font-bold text-[var(--hm-text)]">
              {formatCurrency(unusedDownloadedAmount)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <TicketCheck className="text-[var(--hm-accent-gold)]" size={20} aria-hidden="true" />
              <h2 className="font-bold text-[var(--hm-text)]">최근 사용 처리</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {recentUseEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-[var(--hm-border)] p-3"
                >
                  <p className="text-sm font-semibold text-[var(--hm-text)]">
                    {new Date(event.createdAt).toLocaleString("ko-KR")}
                  </p>
                  <p className="mt-1 text-sm text-[var(--hm-subtext)]">
                    처리자: {event.actorName ?? event.actorEmail ?? "-"}
                  </p>
                </div>
              ))}
              {recentUseEvents.length === 0 ? (
                <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                  최근 사용 처리 내역이 없습니다.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {adminLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="hm-link-focus rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--hm-primary)] hover:shadow-[var(--hm-shadow)]"
              >
                <Icon className="text-[var(--hm-accent-gold)]" size={22} aria-hidden="true" />
                <p className="mt-3 font-semibold text-[var(--hm-text)]">{item.label}</p>
                <Badge className="mt-3" tone="green">
                  운영 가능
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
