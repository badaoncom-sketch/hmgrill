import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Ticket,
  TimerReset,
} from "lucide-react";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth/access";
import {
  couponIssueSelect,
  mapCouponIssue,
  mapMemberCoupon,
  memberCouponSelect,
} from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CouponIssue } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type MetricKey = "overview" | "issued" | "used" | "discount";

const metricMeta: Record<
  MetricKey,
  {
    title: string;
    description: string;
    guide: string[];
  }
> = {
  overview: {
    title: "전체 쿠폰 안내",
    description: "활성, 종료, 수량 소진 쿠폰을 함께 보고 운영 우선순위를 정합니다.",
    guide: [
      "활성 쿠폰이 0개이면 사용자 화면에서 받을 수 있는 혜택이 없습니다.",
      "종료 쿠폰이 많으면 재발행 가능한 쿠폰과 완전히 종료할 쿠폰을 분리합니다.",
      "쿠폰 상세에서 쿠폰번호별 다운로드 및 사용 상태를 확인합니다.",
    ],
  },
  issued: {
    title: "발급 수량 안내",
    description: "다운로드된 쿠폰 수와 발급률을 기준으로 고객 반응을 확인합니다.",
    guide: [
      "발급률이 낮은 쿠폰은 노출 위치, 혜택명, 사용조건을 점검합니다.",
      "발급 수량이 빠르게 증가하면 잔여 수량과 종료 조건을 먼저 확인합니다.",
      "쿠폰번호 검색으로 특정 고객 쿠폰을 역추적할 수 있습니다.",
    ],
  },
  used: {
    title: "사용 수량 안내",
    description: "실제 매장에서 사용 완료된 쿠폰과 사용률을 확인합니다.",
    guide: [
      "사용률이 낮으면 사용기간, 조건, 직원 안내 흐름을 점검합니다.",
      "사용 완료 쿠폰은 직원명과 처리 시간을 기준으로 현장 확인이 가능합니다.",
      "다운로드 대비 사용률을 보고 혜택의 실질 전환을 판단합니다.",
    ],
  },
  discount: {
    title: "할인 처리액 안내",
    description: "사용 완료 쿠폰 기준으로 실제 할인 처리된 금액을 합산합니다.",
    guide: [
      "할인 처리액은 매출 할인 부담을 판단하는 운영 지표입니다.",
      "고액 쿠폰은 사용률보다 처리액 영향이 더 클 수 있습니다.",
      "프로모션 종료 전 잔여 수량과 예상 할인액을 함께 점검합니다.",
    ],
  },
};

function percent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.round((value / total) * 1000) / 10;
}

function sortIssues(metric: MetricKey, issues: CouponIssue[]) {
  return [...issues].sort((a, b) => {
    if (metric === "issued") {
      return b.downloadedCount - a.downloadedCount;
    }

    if (metric === "used") {
      return b.usedCount - a.usedCount;
    }

    if (metric === "discount") {
      return b.usedCount * b.amount - a.usedCount * a.amount;
    }

    return b.quantity - a.quantity;
  });
}

export default async function AdminCouponInsightPage({
  params,
}: {
  params: Promise<{ metric: string }>;
}) {
  const { metric: rawMetric } = await params;
  const metric = rawMetric as MetricKey;
  const meta = metricMeta[metric];

  if (!meta) {
    notFound();
  }

  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    return (
      <AdminFrame
        active="coupons"
        title={meta.title}
        description="관리자 권한과 이메일 인증이 필요합니다."
      >
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 쿠폰 안내가 표시됩니다.
          </p>
        </AdminPanel>
      </AdminFrame>
    );
  }

  const admin = createAdminClient();
  const [{ data: issueRows }, { data: couponRows }] = await Promise.all([
    admin
      .from("coupon_issues")
      .select(couponIssueSelect)
      .order("created_at", { ascending: false }),
    admin
      .from("member_coupons")
      .select(memberCouponSelect)
      .order("downloaded_at", { ascending: false })
      .limit(10),
  ]);
  const issues = (issueRows ?? []).map(mapCouponIssue);
  const coupons = (couponRows ?? []).map(mapMemberCoupon);
  const totalIssued = issues.reduce((sum, item) => sum + item.quantity, 0);
  const totalDownloaded = issues.reduce((sum, item) => sum + item.downloadedCount, 0);
  const totalUsed = issues.reduce((sum, item) => sum + item.usedCount, 0);
  const totalDiscount = issues.reduce((sum, item) => sum + item.usedCount * item.amount, 0);
  const activeCount = issues.filter((item) => item.status === "issuing").length;
  const rankedIssues = sortIssues(metric, issues).slice(0, 8);

  return (
    <AdminFrame active="coupons" title={meta.title} description={meta.description}>
      <div className="grid gap-5">
        <div className="flex">
          <AdminActionLink href="/admin/coupons">
            <ArrowLeft size={17} aria-hidden="true" />
            쿠폰 관리로
          </AdminActionLink>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            href="/admin/coupons/insights/overview"
            icon={<Ticket size={25} aria-hidden="true" />}
            label="전체 쿠폰"
            value={<>{issues.length}개</>}
            detail={`활성 ${activeCount}개 · 총 ${totalIssued}장`}
          />
          <AdminStatCard
            href="/admin/coupons/insights/issued"
            icon={<ClipboardList size={25} aria-hidden="true" />}
            label="발급 수량"
            value={<>{totalDownloaded}장</>}
            detail={`발급률 ${percent(totalDownloaded, totalIssued)}%`}
          />
          <AdminStatCard
            href="/admin/coupons/insights/used"
            icon={<BarChart3 size={25} aria-hidden="true" />}
            label="사용 수량"
            value={<>{totalUsed}장</>}
            detail={`사용률 ${percent(totalUsed, totalDownloaded)}%`}
          />
          <AdminStatCard
            href="/admin/coupons/insights/discount"
            icon={<TimerReset size={25} aria-hidden="true" />}
            label="할인 처리액"
            value={formatCurrency(totalDiscount)}
            detail="사용 완료 기준"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <AdminPanel>
            <AdminPanelHeader title="관련 쿠폰" />
            <div className="overflow-x-auto p-5">
              <table className="min-w-[780px] w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,.08)] text-left text-xs font-extrabold text-[var(--hm-accent-gold)]">
                    <th className="py-3">쿠폰명</th>
                    <th className="py-3">상태</th>
                    <th className="py-3">발급</th>
                    <th className="py-3">사용</th>
                    <th className="py-3">처리액</th>
                    <th className="py-3">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,.06)] text-white/64">
                  {rankedIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="py-4 pr-4 font-extrabold text-white">{issue.name}</td>
                      <td className="py-4">
                        <Badge tone={issue.status === "issuing" ? "green" : "neutral"}>
                          {issue.status === "issuing" ? "활성" : "종료"}
                        </Badge>
                      </td>
                      <td className="py-4">{issue.downloadedCount}장</td>
                      <td className="py-4">{issue.usedCount}장</td>
                      <td className="py-4">{formatCurrency(issue.usedCount * issue.amount)}</td>
                      <td className="py-4">
                        <Link
                          href={`/admin/coupons/${issue.id}`}
                          className="font-bold text-[var(--hm-primary)]"
                        >
                          보기
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rankedIssues.length === 0 ? (
                <p className="py-8 text-sm font-semibold text-white/42">
                  관련 쿠폰이 없습니다.
                </p>
              ) : null}
            </div>
          </AdminPanel>

          <div className="grid gap-5">
            <AdminPanel>
              <AdminPanelHeader title="운영자가 확인할 것" />
              <div className="grid gap-3 p-5">
                {meta.guide.map((item) => (
                  <div
                    key={item}
                    className="rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4 text-sm font-semibold leading-6 text-white/62"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="최근 쿠폰번호" />
              <div className="grid divide-y divide-[rgba(255,255,255,.06)] px-5">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="grid gap-2 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-extrabold text-[var(--hm-primary)]">
                        {coupon.couponNumber}
                      </p>
                      <Badge tone={coupon.status === "available" ? "green" : "neutral"}>
                        {coupon.status === "available" ? "사용 가능" : "처리됨"}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-white/42">
                      {coupon.couponName} · {formatDate(coupon.downloadedAt)}
                    </p>
                  </div>
                ))}
                {coupons.length === 0 ? (
                  <p className="py-8 text-sm font-semibold text-white/42">
                    최근 발급된 쿠폰번호가 없습니다.
                  </p>
                ) : null}
              </div>
            </AdminPanel>
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}
