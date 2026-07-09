import { ClipboardList, Plus } from "lucide-react";
import { CouponGrantPanel } from "@/components/admin/coupon-grant-panel";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth/access";
import { couponIssueSelect, mapCouponIssue } from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCouponGrantPage() {
  const { canAccess } = await requireAdminAccess();
  const admin = createAdminClient();

  const [{ data: issueRows }, { data: recentRows }] = canAccess
    ? await Promise.all([
        admin
          .from("coupon_issues")
          .select(couponIssueSelect)
          .order("created_at", { ascending: false }),
        admin
          .from("member_coupons")
          .select(
            "id,status,revoked_at,downloaded_at,coupon_issues(name,amount),member_profile:profiles!member_coupons_member_id_fkey(name,member_uid)",
          )
          .eq("source", "admin_grant")
          .order("downloaded_at", { ascending: false })
          .limit(5),
      ])
    : [{ data: [] }, { data: [] }];

  // 지급 가능한 발행: 지급 전용(direct) + 발행중 + 재고 보유
  const grantableIssues = (issueRows ?? [])
    .map(mapCouponIssue)
    .filter(
      (issue) =>
        issue.distribution === "direct" &&
        issue.status === "issuing" &&
        issue.quantity - issue.downloadedCount > 0,
    )
    .map((issue) => ({
      id: issue.id,
      name: issue.name,
      amount: issue.amount,
      remaining: issue.quantity - issue.downloadedCount,
      validityDays: issue.validityDays,
    }));

  const one = <T,>(value: T | T[] | null | undefined): T | undefined =>
    Array.isArray(value) ? value[0] : (value ?? undefined);
  const recentGrants = ((recentRows ?? []) as Record<string, unknown>[]).map((row) => {
    const issue = one(row.coupon_issues as { name: string; amount: number } | null);
    const member = one(row.member_profile as { name: string | null; member_uid: string } | null);
    const revoked = Boolean(row.revoked_at);
    return {
      id: row.id as string,
      couponName: issue?.name ?? "쿠폰",
      amount: issue?.amount ?? 0,
      memberName: member?.name ?? "-",
      memberUid: member?.member_uid ?? "-",
      grantedAt: row.downloaded_at as string,
      stateLabel: revoked
        ? "회수됨"
        : row.status === "used"
          ? "사용완료"
          : row.status === "available"
            ? "미사용"
            : "기간만료",
      stateTone: revoked
        ? ("red" as const)
        : row.status === "available"
          ? ("green" as const)
          : ("neutral" as const),
    };
  });

  return (
    <AdminFrame
      active="coupons"
      title="쿠폰 직접 지급"
      description="회원을 지정해 발행된 쿠폰을 지급하거나, 금액을 입력해 즉석에서 지급합니다."
      backHref="/admin/coupons"
      backLabel="쿠폰 관리"
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 쿠폰을 지급할 수 있습니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AdminPanel>
            <AdminPanelHeader title="회원 지정 지급" />
            <CouponGrantPanel issues={grantableIssues} />
          </AdminPanel>

          <div className="grid content-start gap-5">
            <AdminPanel>
              <AdminPanelHeader title="최근 지급 5건" />
              <div className="grid gap-2.5 p-5">
                {recentGrants.map((grant) => (
                  <div
                    key={grant.id}
                    className="rounded-[14px] border border-[rgba(255,255,255,.08)] bg-black/20 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {grant.memberName}
                          <span className="ml-1.5 font-mono text-[11px] tracking-[0.08em] text-[var(--hm-accent-gold)]">
                            {grant.memberUid}
                          </span>
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/55">
                          {grant.couponName}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-[var(--hm-primary)]">
                        {formatCurrency(grant.amount)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold text-white/45">
                        {new Date(grant.grantedAt).toLocaleDateString("ko-KR")}
                      </span>
                      <Badge tone={grant.stateTone}>{grant.stateLabel}</Badge>
                    </div>
                  </div>
                ))}
                {recentGrants.length === 0 ? (
                  <p className="rounded-[14px] border border-dashed border-[rgba(255,255,255,.12)] px-4 py-6 text-center text-sm font-semibold text-white/42">
                    아직 직접 지급한 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>
            </AdminPanel>

            <AdminPanel>
              <AdminPanelHeader title="바로가기" />
              <div className="grid gap-3 p-5">
                <AdminActionLink href="/admin/coupons/grants">
                  <ClipboardList size={17} aria-hidden="true" />
                  직접 지급 전체 내역 · 회수
                </AdminActionLink>
                <AdminActionLink href="/admin/coupons/new">
                  <Plus size={17} aria-hidden="true" />
                  지급 전용 쿠폰 새로 만들기
                </AdminActionLink>
              </div>
            </AdminPanel>
          </div>
        </div>
      )}
    </AdminFrame>
  );
}
