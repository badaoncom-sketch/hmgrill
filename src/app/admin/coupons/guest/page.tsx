import { BadgeCheck, Hourglass, QrCode, TicketPercent, TimerOff } from "lucide-react";
import {
  AdminActionLink,
  AdminFrame,
  AdminPanel,
  AdminPanelHeader,
  AdminStatCard,
} from "@/components/admin/admin-frame";
import { Badge } from "@/components/ui/badge";
import { requireAdminAccess } from "@/lib/auth/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminGuestCouponsPage() {
  const { canAccess } = await requireAdminAccess();
  const admin = createAdminClient();

  const { data: guestRows } = canAccess
    ? await admin
        .from("member_coupons")
        .select(
          "id,coupon_number,status,used_at,revoked_at,downloaded_at,valid_until,coupon_issues(name,amount),granter:profiles!member_coupons_granted_by_fkey(name),staff_profile:profiles!member_coupons_used_by_staff_id_fkey(name)",
        )
        .eq("source", "guest_claim")
        .order("downloaded_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const one = <T,>(value: T | T[] | null | undefined): T | undefined =>
    Array.isArray(value) ? value[0] : (value ?? undefined);
  const guestCoupons = ((guestRows ?? []) as Record<string, unknown>[]).map((row) => {
    const issue = one(row.coupon_issues as { name: string; amount: number } | null);
    const granter = one(row.granter as { name: string | null } | null);
    const staff = one(row.staff_profile as { name: string | null } | null);
    const expired =
      (row.status as string) === "expired" ||
      new Date(row.valid_until as string) < new Date();
    return {
      id: row.id as string,
      couponNumber: row.coupon_number as string,
      status: row.status as string,
      usedAt: (row.used_at as string | null) ?? null,
      issuedAt: row.downloaded_at as string,
      validUntil: row.valid_until as string,
      couponName: issue?.name ?? "쿠폰",
      amount: issue?.amount ?? 0,
      issuerName: granter?.name ?? "-",
      staffName: staff?.name ?? null,
      expired,
    };
  });

  const summary = {
    issued: guestCoupons.length,
    used: guestCoupons.filter((coupon) => coupon.status === "used").length,
    unused: guestCoupons.filter(
      (coupon) => coupon.status === "available" && !coupon.expired,
    ).length,
    expired: guestCoupons.filter(
      (coupon) => coupon.status !== "used" && coupon.expired,
    ).length,
    issuedAmount: guestCoupons.reduce((sum, coupon) => sum + coupon.amount, 0),
    usedAmount: guestCoupons
      .filter((coupon) => coupon.status === "used")
      .reduce((sum, coupon) => sum + coupon.amount, 0),
    unusedAmount: guestCoupons
      .filter((coupon) => coupon.status === "available" && !coupon.expired)
      .reduce((sum, coupon) => sum + coupon.amount, 0),
    expiredAmount: guestCoupons
      .filter((coupon) => coupon.status !== "used" && coupon.expired)
      .reduce((sum, coupon) => sum + coupon.amount, 0),
  };

  return (
    <AdminFrame
      active="coupons"
      title="비회원 쿠폰 내역"
      description="계산대 QR로 발급한 비회원 쿠폰의 발급·사용·만료 현황을 관리합니다."
      backHref="/admin/coupons"
      backLabel="쿠폰 관리"
    >
      {!canAccess ? (
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 비회원 쿠폰 내역이 표시됩니다.
          </p>
        </AdminPanel>
      ) : (
        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            <AdminStatCard
              icon={<TicketPercent size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="발급"
              value={<>{summary.issued}장</>}
              detail={<>{formatCurrency(summary.issuedAmount)}</>}
            />
            <AdminStatCard
              icon={<BadgeCheck size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="사용 완료"
              value={<>{summary.used}장</>}
              detail={<>{formatCurrency(summary.usedAmount)} 할인 적용</>}
            />
            <AdminStatCard
              icon={<Hourglass size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="미사용 (유효)"
              value={<>{summary.unused}장</>}
              detail={<>{formatCurrency(summary.unusedAmount)} 사용 대기</>}
            />
            <AdminStatCard
              icon={<TimerOff size={25} strokeWidth={1.8} aria-hidden="true" />}
              label="만료"
              value={<>{summary.expired}장</>}
              detail={<>{formatCurrency(summary.expiredAmount)} 소멸</>}
            />
          </div>

          <AdminPanel>
            <AdminPanelHeader
              title="발급 내역"
              action={
                <AdminActionLink href="/qr-coupon" className="min-h-10">
                  <QrCode size={16} aria-hidden="true" />
                  계산대 QR 발급 화면
                </AdminActionLink>
              }
            />
            <div className="p-4 md:p-5">
              {/* 모바일·태블릿: 카드 리스트 */}
              <div className="grid gap-3 lg:hidden">
                {guestCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="rounded-[16px] border border-[rgba(255,255,255,.08)] bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[13px] tracking-[0.1em] text-[var(--hm-primary)]">
                          {coupon.couponNumber}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-white/55">
                          {coupon.couponName}
                        </p>
                      </div>
                      <p className="shrink-0 text-[16px] font-bold text-[var(--hm-primary)]">
                        {formatCurrency(coupon.amount)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-white/45">
                      <span>발급 {new Date(coupon.issuedAt).toLocaleDateString("ko-KR")}</span>
                      <span>{coupon.issuerName}</span>
                      <span>~{new Date(coupon.validUntil).toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Badge tone={coupon.status === "used" ? "green" : coupon.expired ? "red" : "neutral"}>
                        {coupon.status === "used" ? "사용완료" : coupon.expired ? "만료" : "미사용"}
                      </Badge>
                      {coupon.staffName ? (
                        <span className="text-[11px] font-semibold text-white/45">
                          처리 {coupon.staffName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
                {guestCoupons.length === 0 ? (
                  <p className="rounded-[16px] border border-dashed border-[rgba(255,255,255,.12)] px-5 py-8 text-center text-sm font-semibold text-white/42">
                    발급된 비회원 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>

              {/* PC: 테이블 */}
              <div className="hidden rounded-[18px] border border-[rgba(255,255,255,.08)] lg:block">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-white/[0.035]">
                    <tr>
                      {["발급일", "쿠폰번호", "캠페인", "금액", "발급 직원", "유효기간", "상태", "처리 직원"].map((head) => (
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
                    {guestCoupons.map((coupon) => (
                      <tr key={coupon.id} className="transition hover:bg-white/[0.025]">
                        <td className="px-4 py-3.5 text-white/60">
                          {new Date(coupon.issuedAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--hm-primary)]">
                          {coupon.couponNumber}
                        </td>
                        <td className="px-4 py-3.5 text-white/72">{coupon.couponName}</td>
                        <td className="px-4 py-3.5 font-bold text-[var(--hm-primary)]">
                          {formatCurrency(coupon.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-white/60">{coupon.issuerName}</td>
                        <td className="px-4 py-3.5 text-white/60">
                          {new Date(coupon.validUntil).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            tone={coupon.status === "used" ? "green" : coupon.expired ? "red" : "neutral"}
                          >
                            {coupon.status === "used" ? "사용완료" : coupon.expired ? "만료" : "미사용"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-white/60">{coupon.staffName ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {guestCoupons.length === 0 ? (
                  <p className="px-5 py-8 text-sm font-semibold text-white/42">
                    발급된 비회원 쿠폰이 없습니다.
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-[11px] font-semibold text-white/38">
                * 최근 발급 100장까지 표시됩니다. 정확한 기간별 합계는 쿠폰 정산 리포트에서 확인하세요.
              </p>
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminFrame>
  );
}
