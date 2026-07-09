import { Send } from "lucide-react";
import { revokeGrantedCouponAction } from "@/app/actions/coupon-grants";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
} from "@/components/admin/admin-frame";
import { InlineSubmitButton } from "@/components/inline-submit-button";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCouponGrantsLedgerPage() {
  const { canAccess } = await requireAdminAccess();
  const admin = createAdminClient();

  const { data: grantRows } = canAccess
    ? await admin
        .from("member_coupons")
        .select(
          "id,coupon_number,status,used_at,revoked_at,grant_note,downloaded_at,valid_until,coupon_issues(name,amount),member_profile:profiles!member_coupons_member_id_fkey(name,member_uid),granter:profiles!member_coupons_granted_by_fkey(name)",
        )
        .eq("source", "admin_grant")
        .order("downloaded_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const one = <T,>(value: T | T[] | null | undefined): T | undefined =>
    Array.isArray(value) ? value[0] : (value ?? undefined);
  const grants = ((grantRows ?? []) as Record<string, unknown>[]).map((row) => {
    const issue = one(row.coupon_issues as { name: string; amount: number } | null);
    const member = one(row.member_profile as { name: string | null; member_uid: string } | null);
    const granter = one(row.granter as { name: string | null } | null);
    return {
      id: row.id as string,
      couponNumber: row.coupon_number as string,
      status: row.status as string,
      usedAt: (row.used_at as string | null) ?? null,
      revokedAt: (row.revoked_at as string | null) ?? null,
      note: (row.grant_note as string | null) ?? null,
      grantedAt: row.downloaded_at as string,
      couponName: issue?.name ?? "쿠폰",
      amount: issue?.amount ?? 0,
      memberName: member?.name ?? "-",
      memberUid: member?.member_uid ?? "-",
      granterName: granter?.name ?? "-",
    };
  });

  const summary = {
    granted: grants.length,
    grantedAmount: grants.reduce((sum, grant) => sum + grant.amount, 0),
    used: grants.filter((grant) => !grant.revokedAt && grant.status === "used").length,
    unused: grants.filter((grant) => !grant.revokedAt && grant.status === "available").length,
    revoked: grants.filter((grant) => Boolean(grant.revokedAt)).length,
  };

  return (
    <AdminFrame
      active="coupons"
      title="직접 지급 내역"
      description="회원에게 직접 지급한 쿠폰의 사용 여부를 확인하고, 미사용 쿠폰은 회수할 수 있습니다."
      backHref="/admin/coupons"
      backLabel="쿠폰 관리"
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 지급 내역이 표시됩니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5">
          <AdminPanel>
            <AdminPanelHeader
              title="지급 내역"
              action={
                <AdminActionLink href="/admin/coupons/grant" className="min-h-10">
                  <Send size={16} aria-hidden="true" />
                  쿠폰 지급하기
                </AdminActionLink>
              }
            />
            <div className="p-4 md:p-5">
              <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 rounded-[14px] border border-[rgba(255,255,255,.08)] bg-black/20 px-4 py-3 text-[13px] font-semibold text-white/60 md:text-sm">
                <span>
                  지급 {summary.granted}건 · {formatCurrency(summary.grantedAmount)}
                </span>
                <span className="text-emerald-200/80">사용 {summary.used}건</span>
                <span>미사용 {summary.unused}건</span>
                <span className="text-[#f0a39b]/80">회수 {summary.revoked}건</span>
              </div>

              {/* 모바일·태블릿: 카드 리스트 */}
              <div className="grid gap-3 lg:hidden">
                {grants.map((grant) => {
                  const revoked = Boolean(grant.revokedAt);
                  return (
                    <div
                      key={grant.id}
                      className="rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4"
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
                        <p className="shrink-0 text-[16px] font-bold text-[var(--hm-primary)]">
                          {formatCurrency(grant.amount)}
                        </p>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-white/45">
                        <span>{new Date(grant.grantedAt).toLocaleDateString("ko-KR")}</span>
                        <span>지급 {grant.granterName}</span>
                        {grant.note ? <span className="truncate">메모 {grant.note}</span> : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Badge
                          tone={
                            revoked
                              ? "red"
                              : grant.status === "used"
                                ? "neutral"
                                : grant.status === "available"
                                  ? "green"
                                  : "neutral"
                          }
                        >
                          {revoked
                            ? "회수됨"
                            : grant.status === "used"
                              ? "사용완료"
                              : grant.status === "available"
                                ? "미사용"
                                : "기간만료"}
                        </Badge>
                        {!revoked && grant.status === "available" ? (
                          <form action={revokeGrantedCouponAction}>
                            <input type="hidden" name="memberCouponId" value={grant.id} />
                            <InlineSubmitButton className="hm-link-focus rounded-[10px] border border-[rgba(198,59,45,.4)] px-3 py-1.5 text-xs font-bold text-[#f0a39b]">
                              회수
                            </InlineSubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {grants.length === 0 ? (
                  <p className="rounded-[16px] border border-dashed border-[rgba(255,255,255,.12)] px-5 py-8 text-center text-sm font-semibold text-white/42">
                    직접 지급한 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>

              {/* PC: 테이블 */}
              <div className="hidden rounded-[18px] border border-[rgba(255,255,255,.08)] lg:block">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-white/[0.035]">
                    <tr>
                      {["지급일", "회원", "쿠폰", "금액", "지급자", "메모", "상태", "관리"].map((head) => (
                        <th
                          key={head}
                          className="px-4 py-3.5 text-left text-xs font-extrabold text-[var(--hm-accent-gold)]"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,.06)]">
                    {grants.map((grant) => {
                      const revoked = Boolean(grant.revokedAt);
                      const stateLabel = revoked
                        ? "회수됨"
                        : grant.status === "used"
                          ? "사용완료"
                          : grant.status === "available"
                            ? "미사용"
                            : "기간만료";
                      return (
                        <tr key={grant.id} className="transition hover:bg-white/[0.025]">
                          <td className="px-4 py-3.5 text-white/60">
                            {new Date(grant.grantedAt).toLocaleDateString("ko-KR")}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-white">{grant.memberName}</span>
                            <span className="ml-2 font-mono text-[11px] tracking-[0.1em] text-[var(--hm-accent-gold)]">
                              {grant.memberUid}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-white/72">{grant.couponName}</td>
                          <td className="px-4 py-3.5 font-bold text-[var(--hm-primary)]">
                            {formatCurrency(grant.amount)}
                          </td>
                          <td className="px-4 py-3.5 text-white/60">{grant.granterName}</td>
                          <td className="max-w-[180px] truncate px-4 py-3.5 text-white/50">
                            {grant.note ?? "-"}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              tone={
                                revoked
                                  ? "red"
                                  : grant.status === "used"
                                    ? "neutral"
                                    : grant.status === "available"
                                      ? "green"
                                      : "neutral"
                              }
                            >
                              {stateLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            {!revoked && grant.status === "available" ? (
                              <form action={revokeGrantedCouponAction}>
                                <input type="hidden" name="memberCouponId" value={grant.id} />
                                <InlineSubmitButton className="hm-link-focus rounded-[8px] border border-[rgba(198,59,45,.4)] px-2.5 py-1 text-xs font-bold text-[#f0a39b] transition hover:bg-[rgba(198,59,45,.14)]">
                                  회수
                                </InlineSubmitButton>
                              </form>
                            ) : (
                              <span className="text-xs text-white/30">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {grants.length === 0 ? (
                  <p className="px-5 py-8 text-sm font-semibold text-white/42">
                    직접 지급한 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-white/38">
                * 최근 지급 100건까지 표시됩니다. 회수는 미사용 상태의 쿠폰만 가능합니다.
              </p>
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminFrame>
  );
}
