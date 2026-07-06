import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  QrCode,
  RotateCcw,
  StopCircle,
  Ticket,
  UsersRound,
} from "lucide-react";
import {
  resumeCouponIssueAction,
  stopCouponIssueAction,
} from "@/app/actions/coupons";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <AdminFrame
        active="coupons"
        title="쿠폰 상세"
        description="관리자 권한과 이메일 인증이 필요합니다."
      >
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 쿠폰 상세 이력이 표시됩니다.
          </p>
        </AdminPanel>
      </AdminFrame>
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
  const usageRate = issue.downloadedCount > 0 ? Math.round((issue.usedCount / issue.downloadedCount) * 1000) / 10 : 0;

  return (
    <AdminFrame
      active="coupons"
      title={issue.name}
      description="쿠폰 발행 상태, 다운로드 내역, 사용완료 이력을 확인합니다."
    >
      <div className="grid gap-5">
        <div className="flex">
          <AdminActionLink href="/admin/coupons">
            <ArrowLeft size={17} aria-hidden="true" />
            쿠폰 목록으로
          </AdminActionLink>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            icon={<Ticket size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="할인 혜택"
            value={formatCurrency(issue.amount)}
            detail={`다운로드 후 ${issue.validityDays}일 사용`}
          />
          <AdminStatCard
            icon={<ClipboardList size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="총 발행"
            value={<>{issue.quantity}장</>}
            detail={`잔여 ${remainingCount}장`}
          />
          <AdminStatCard
            icon={<UsersRound size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="다운로드"
            value={<>{issue.downloadedCount}장</>}
            detail={`사용 완료 ${issue.usedCount}장`}
          />
          <AdminStatCard
            icon={<RotateCcw size={25} strokeWidth={1.8} aria-hidden="true" />}
            label="사용률"
            value={<>{usageRate}%</>}
            detail={`기간 만료 ${issue.expiredCount}장`}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[440px_minmax(0,1fr)]">
          <div className="grid gap-5">
            <AdminPanel>
              <AdminPanelHeader title="쿠폰 미리보기" />
              <div className="p-5">
                <div className="overflow-hidden rounded-[24px] border border-[rgba(247,230,193,.22)] bg-[linear-gradient(135deg,#f7e6c1,#d6ad62)] p-5 text-[#18120a] shadow-[0_24px_70px_rgba(0,0,0,.34)]">
                  <p className="text-xs font-extrabold uppercase tracking-[.28em] text-[#6d4b13]">
                    Hwamok Coupon
                  </p>
                  <h2 className="mt-5 text-[34px] font-extrabold leading-none">
                    {formatCurrency(issue.amount)}
                  </h2>
                  <p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[#4d3510]">
                    {issue.name}
                  </p>
                  <div className="mt-6 grid grid-cols-[1fr_92px] gap-4">
                    <div className="rounded-[16px] border border-black/10 bg-white/30 p-4">
                      <p className="text-xs font-extrabold text-[#6d4b13]">쿠폰번호</p>
                      <p className="mt-2 text-xl font-black">
                        {coupons[0]?.couponNumber ?? "발급 시 생성"}
                      </p>
                    </div>
                    <div className="grid aspect-square place-items-center rounded-[16px] bg-[#111] text-[#f7e6c1]">
                      <QrCode size={46} aria-hidden="true" />
                    </div>
                  </div>
                  <p className="mt-5 text-xs font-bold leading-5 text-[#5c4218]">
                    다운로드 후 {issue.validityDays}일 ·{" "}
                    {issue.useFlow === "staff_confirm" ? "직원 확인" : "자동 완료"}
                  </p>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="발행 정보" />
              <div className="grid gap-5 p-5">
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
                <dl className="grid gap-4 text-sm font-semibold text-white/58">
                  <div className="flex justify-between gap-4">
                    <dt>재다운로드</dt>
                    <dd className="text-white/78">
                      {issue.redownloadPolicy === "after_use_allowed"
                        ? "사용 후 가능"
                        : "회원당 1회"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>사용 처리</dt>
                    <dd className="text-white/78">
                      {issue.useFlow === "staff_confirm" ? "직원 확인" : "자동 완료"}
                    </dd>
                  </div>
                </dl>
                <div className="rounded-[18px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4 text-sm leading-6 text-white/64">
                  <p className="font-bold text-[var(--hm-primary)]">상세내용 및 사용조건</p>
                  <p className="mt-2 whitespace-pre-line">{issue.conditionText || "조건 없음"}</p>
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
                    className="w-full"
                  >
                    {issue.status === "issuing" ? (
                      <StopCircle size={16} aria-hidden="true" />
                    ) : (
                      <RotateCcw size={16} aria-hidden="true" />
                    )}
                    {issue.status === "issuing" ? "발행중단" : "재발행"}
                  </Button>
                </form>
              </div>
            </AdminPanel>
          </div>

          <AdminPanel>
            <AdminPanelHeader title="이벤트 이력" />
            <div className="grid divide-y divide-[rgba(255,255,255,.06)] px-5">
              {events.map((event) => (
                <div key={event.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{eventLabels[event.eventType] ?? event.eventType}</Badge>
                      <p className="text-sm font-bold text-white">
                        {new Date(event.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white/48">
                      처리자 {event.actorName ?? event.actorEmail ?? "-"}
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 ? (
                <p className="py-8 text-sm font-semibold text-white/42">
                  기록된 이벤트가 없습니다.
                </p>
              ) : null}
            </div>
          </AdminPanel>
        </div>

        <AdminPanel>
          <AdminPanelHeader title="다운로드 쿠폰" />
          <div className="overflow-x-auto p-5">
            <table className="min-w-[920px] w-full border-collapse overflow-hidden rounded-[18px] text-sm">
              <thead className="bg-white/[0.035]">
                <tr>
                  {["회원", "쿠폰번호", "상태", "다운로드", "유효기간", "사용 직원"].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-4 text-left text-xs font-extrabold text-[var(--hm-accent-gold)]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,.06)]">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="transition hover:bg-white/[0.025]">
                    <td className="px-4 py-4 font-bold text-white">
                      {coupon.memberName || "회원"}
                    </td>
                    <td className="px-4 py-4 font-extrabold text-[var(--hm-primary)]">
                      {coupon.couponNumber}
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={coupon.status === "available" ? "green" : "neutral"}>
                        {couponStatusLabels[coupon.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-white/62">{formatDate(coupon.downloadedAt)}</td>
                    <td className="px-4 py-4 text-white/62">
                      {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                    </td>
                    <td className="px-4 py-4 text-white/62">{coupon.usedByStaffName ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {coupons.length === 0 ? (
              <p className="py-8 text-sm font-semibold text-white/42">
                다운로드된 쿠폰이 없습니다.
              </p>
            ) : null}
          </div>
        </AdminPanel>
      </div>
    </AdminFrame>
  );
}
