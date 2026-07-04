import Link from "next/link";
import { notFound } from "next/navigation";
import {
  resumeCouponIssueAction,
  stopCouponIssueAction,
} from "@/app/actions/coupons";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import {
  couponEventSelect,
  couponIssueSelect,
  mapCouponEvent,
  mapCouponIssue,
  mapMemberCoupon,
  memberCouponSelect,
} from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

const eventLabels: Record<string, string> = {
  issue_created: "발행",
  issue_stopped: "발행중단",
  issue_resumed: "재발행",
  coupon_downloaded: "다운로드",
  coupon_used: "사용완료",
  coupon_expired: "기간만료",
};

const couponStatusLabels = {
  available: "사용 가능",
  used: "사용 완료",
  expired: "기간 만료",
};

export default async function AdminCouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    return (
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="COUPON ADMIN"
          title="쿠폰 상세"
          description="쿠폰 발행별 다운로드와 사용 이력을 확인합니다."
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

  const admin = createAdminClient();
  const [{ data: issueRow }, { data: couponRows }, { data: eventRows }] =
    await Promise.all([
      admin.from("coupon_issues").select(couponIssueSelect).eq("id", id).maybeSingle(),
      admin
        .from("member_coupons")
        .select(memberCouponSelect)
        .eq("issue_id", id)
        .order("downloaded_at", { ascending: false }),
      admin
        .from("coupon_events")
        .select(couponEventSelect)
        .eq("issue_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!issueRow) {
    notFound();
  }

  const issue = mapCouponIssue(issueRow);
  const coupons = (couponRows ?? []).map(mapMemberCoupon);
  const events = (eventRows ?? []).map(mapCouponEvent);
  const remainingCount = issue.quantity - issue.downloadedCount;

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="COUPON ADMIN"
        title={issue.name}
        description="쿠폰 발행 상태, 다운로드 내역, 사용완료 이력을 확인합니다."
      />
      <div className="flex">
        <Link
          href="/admin/coupons"
          className="text-sm font-semibold text-neutral-600 hover:text-neutral-950"
        >
          쿠폰 목록으로
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
                {issue.status === "issuing" ? "발행중" : "발행종료"}
              </Badge>
              {issue.endReason ? (
                <Badge tone={issue.endReason === "admin_stopped" ? "amber" : "red"}>
                  {issue.endReason === "admin_stopped" ? "관리자 중단" : "수량 소진"}
                </Badge>
              ) : null}
            </div>
            <h2 className="mt-3 text-xl font-bold text-neutral-950">
              발행 정보
            </h2>
          </CardHeader>
          <CardContent className="grid gap-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-neutral-950">금액</dt>
                <dd className="text-neutral-600">{formatCurrency(issue.amount)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-950">총 발행</dt>
                <dd className="text-neutral-600">{issue.quantity}장</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-950">다운로드</dt>
                <dd className="text-neutral-600">{issue.downloadedCount}장</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-950">잔여</dt>
                <dd className="text-neutral-600">{remainingCount}장</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-950">사용완료</dt>
                <dd className="text-neutral-600">{issue.usedCount}장</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-950">기간만료</dt>
                <dd className="text-neutral-600">{issue.expiredCount}장</dd>
              </div>
            </dl>
            <div className="rounded-md bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
              <p className="font-semibold text-neutral-950">사용조건</p>
              <p className="mt-2 whitespace-pre-line">{issue.conditionText}</p>
            </div>
            <form
              action={
                issue.status === "issuing"
                  ? stopCouponIssueAction
                  : resumeCouponIssueAction
              }
            >
              <input name="issueId" type="hidden" value={issue.id} />
              <Button
                type="submit"
                variant={issue.status === "issuing" ? "danger" : "outline"}
                disabled={
                  issue.status === "ended" && issue.endReason !== "admin_stopped"
                }
              >
                {issue.status === "issuing" ? "발행중단" : "재발행"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-neutral-950">이벤트 이력</h2>
          </CardHeader>
          <CardContent className="grid gap-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-md border border-neutral-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{eventLabels[event.eventType] ?? event.eventType}</Badge>
                  <p className="text-sm font-semibold text-neutral-950">
                    {new Date(event.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                  처리자: {event.actorName ?? event.actorEmail ?? "-"}
                </p>
              </div>
            ))}
            {events.length === 0 ? (
              <p className="text-sm font-semibold text-neutral-600">
                기록된 이벤트가 없습니다.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-neutral-950">다운로드 쿠폰</h2>
        </CardHeader>
        <CardContent className="grid gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="grid gap-4 rounded-md border border-neutral-200 p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-neutral-950">
                    {coupon.memberName || "회원"}
                  </h3>
                  <Badge tone={coupon.status === "available" ? "green" : "neutral"}>
                    {couponStatusLabels[coupon.status]}
                  </Badge>
                </div>
                <dl className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-neutral-950">다운로드</dt>
                    <dd>{formatDate(coupon.downloadedAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-neutral-950">유효기간</dt>
                    <dd>
                      {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-neutral-950">사용 직원</dt>
                    <dd>{coupon.usedByStaffName ?? "-"}</dd>
                  </div>
                </dl>
              </div>
              <p className="break-all rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
                {coupon.token}
              </p>
            </div>
          ))}
          {coupons.length === 0 ? (
            <p className="text-sm font-semibold text-neutral-600">
              다운로드된 쿠폰이 없습니다.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
