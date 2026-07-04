import Link from "next/link";
import { BarChart3, Users, UserRoundCog } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
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
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="ADMIN"
          title="관리자 대시보드"
          description="쿠폰 현황, 금액 통계, 회원과 직원 운영 메뉴를 확인합니다."
        />
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-red-700">
              관리자 권한과 이메일 인증이 필요합니다.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { data: rows } = await createAdminClient()
    .from("coupon_issues")
    .select(couponIssueSelect);
  const couponIssues = (rows ?? []).map(mapCouponIssue);
  const totalIssued = couponIssues.reduce((sum, item) => sum + item.quantity, 0);
  const totalDownloaded = couponIssues.reduce(
    (sum, item) => sum + item.downloadedCount,
    0,
  );
  const totalUsedAmount = couponIssues.reduce(
    (sum, item) => sum + item.usedCount * item.amount,
    0,
  );

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="ADMIN"
        title="관리자 대시보드"
        description="쿠폰 현황, 금액 통계, 회원과 직원 운영 메뉴를 확인합니다."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-neutral-500">총 발행 수량</p>
            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {totalIssued}장
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-neutral-500">다운로드 수량</p>
            <p className="mt-2 text-3xl font-bold text-neutral-950">
              {totalDownloaded}장
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-neutral-500">총 사용 금액</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {formatCurrency(totalUsedAmount)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-neutral-950"
            >
              <Icon className="text-red-700" size={22} aria-hidden="true" />
              <p className="mt-3 font-semibold text-neutral-950">{item.label}</p>
              <Badge className="mt-3">준비중</Badge>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
