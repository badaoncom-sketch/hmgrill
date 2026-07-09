import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { getEffectiveMemberCouponStatus } from "@/lib/coupon-policy";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "쿠폰 사용내역",
  description: "받은 혜택의 사용 가능 여부, 사용일시, 만료 상태를 확인합니다.",
};

const statusLabels = {
  available: "사용 가능",
  used: "사용 완료",
  expired: "기간 만료",
} as const;

const statusTones = {
  available: "green",
  used: "neutral",
  expired: "red",
} as const;

export default async function CouponHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.email_verified) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("member_coupons")
    .select(memberCouponSelect)
    .eq("member_id", user.id)
    .order("downloaded_at", { ascending: false });
  const memberCoupons = (rows ?? []).map(mapMemberCoupon).map((coupon) => ({
    ...coupon,
    effectiveStatus: getEffectiveMemberCouponStatus(coupon),
  }));

  const summary = [
    {
      label: "사용 가능",
      count: memberCoupons.filter((c) => c.effectiveStatus === "available").length,
    },
    {
      label: "사용 완료",
      count: memberCoupons.filter((c) => c.effectiveStatus === "used").length,
    },
    {
      label: "기간 만료",
      count: memberCoupons.filter((c) => c.effectiveStatus === "expired").length,
    },
  ];

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">History</p>
            <h1 className="hm-section-title mt-3 md:mt-5">쿠폰 사용내역</h1>
            <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">
              받은 혜택의 사용 가능 여부, 사용일시, 만료 상태를 확인합니다.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <ButtonLink href="/coupons/my" variant="outline">
              내 쿠폰
            </ButtonLink>
            <ButtonLink href="/coupons" variant="ghost">
              쿠폰 받기
            </ButtonLink>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-2.5 md:mt-12 md:gap-4">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-3.5 md:rounded-[20px] md:p-6"
            >
              <p className="text-xs font-semibold text-[var(--hm-subtext)] md:text-sm">{item.label}</p>
              <p className="mt-2 text-[22px] font-bold leading-none text-[var(--hm-primary)] md:mt-3 md:text-[34px]">
                {item.count}
                <span className="ml-1 text-[12px] font-semibold text-white/45 md:text-[15px]">장</span>
              </p>
            </div>
          ))}
        </div>

        {memberCoupons.length > 0 ? (
          <div className="mt-7 overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] md:mt-10 md:rounded-[24px]">
            <div className="divide-y divide-[var(--hm-divider)]">
              {memberCoupons.map((coupon) => (
                <div key={coupon.id} className="p-4 md:p-6 lg:px-8">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Badge tone={statusTones[coupon.effectiveStatus]}>
                        {statusLabels[coupon.effectiveStatus]}
                      </Badge>
                      <h2 className="truncate text-[15px] font-bold text-[var(--hm-text)] md:text-lg">
                        {coupon.couponName}
                      </h2>
                      {coupon.source === "admin_grant" ? (
                        <span className="shrink-0 rounded-full border border-[rgba(247,230,193,.3)] px-2 py-0.5 text-[10px] font-bold text-[var(--hm-accent-gold)]">
                          화목이 드린 혜택
                        </span>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-[16px] font-bold leading-none text-[var(--hm-accent-gold)] md:text-[20px]">
                      {formatCurrency(coupon.amount)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[var(--hm-subtext)] md:mt-2.5 md:text-sm">
                    <span className="font-mono tracking-[0.12em] text-[var(--hm-primary)]/80">
                      No. {coupon.couponNumber}
                    </span>
                    <span>
                      {coupon.source === "admin_grant" ? "지급" : "다운로드"}{" "}
                      {formatDate(coupon.downloadedAt)}
                    </span>
                    <span>
                      {coupon.usedAt
                        ? `사용 ${new Date(coupon.usedAt).toLocaleString("ko-KR")}`
                        : `유효기간 ${formatDate(coupon.validUntil)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              쿠폰 사용내역이 없습니다. 발행 중인 방문 혜택을 확인해 보세요.
            </p>
            <ButtonLink href="/coupons" className="mt-6">
              쿠폰 받으러 가기
            </ButtonLink>
          </div>
        )}
      </Container>
    </main>
  );
}
