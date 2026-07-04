import { CouponIssueForm } from "@/components/admin/coupon-issue-form";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const { canAccess } = await requireAdminAccess();
  const { data: rows } = canAccess
    ? await createAdminClient()
        .from("coupon_issues")
        .select(couponIssueSelect)
        .order("created_at", { ascending: false })
    : { data: [] };
  const couponIssues = (rows ?? []).map(mapCouponIssue);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="COUPON ADMIN"
        title="쿠폰관리"
        description="쿠폰 발행 입력 항목, 목록, 다운로드 내역, 사용 내역, 통계의 시작 화면입니다."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-950">쿠폰 발행</h2>
            <p className="mt-1 text-sm text-neutral-500">
              기본값은 사용 후 재다운로드 가능, 직원 확인 후 사용완료입니다.
            </p>
          </CardHeader>
          <CardContent>
            {canAccess ? (
              <CouponIssueForm />
            ) : (
              <p className="text-sm leading-6 text-red-700">
                관리자 권한과 이메일 인증이 필요합니다.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-950">쿠폰 목록</h2>
          </CardHeader>
          <CardContent className="grid gap-4">
            {couponIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-md border border-neutral-200 p-4"
              >
                <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
                  {issue.status === "issuing" ? "발행중" : "발행종료"}
                </Badge>
                <h3 className="mt-3 font-bold text-neutral-950">{issue.name}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatCurrency(issue.amount)} / {issue.downloadedCount}장
                  다운로드
                </p>
              </div>
            ))}
            {!canAccess ? (
              <p className="text-sm text-neutral-500">
                관리자 권한이 확인되면 쿠폰 이력이 표시됩니다.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
