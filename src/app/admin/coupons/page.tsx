import { CouponIssueForm } from "@/components/admin/coupon-issue-form";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { couponIssues } from "@/lib/site-data";
import { formatCurrency } from "@/lib/utils";

export default function AdminCouponsPage() {
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
            <CouponIssueForm />
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
