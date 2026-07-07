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
            <h1 className="hm-section-title mt-5">쿠폰 사용내역</h1>
            <p className="hm-body mt-5 text-[var(--hm-subtext)]">
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

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-6"
            >
              <p className="text-sm font-semibold text-[var(--hm-subtext)]">{item.label}</p>
              <p className="mt-3 text-[34px] font-bold leading-none text-[var(--hm-primary)]">
                {item.count}
                <span className="ml-1 text-[15px] font-semibold text-white/45">장</span>
              </p>
            </div>
          ))}
        </div>

        {memberCoupons.length > 0 ? (
          <div className="mt-10 overflow-hidden rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
            <div className="divide-y divide-[var(--hm-divider)]">
              {memberCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between lg:px-8"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone={statusTones[coupon.effectiveStatus]}>
                        {statusLabels[coupon.effectiveStatus]}
                      </Badge>
                      <p className="font-mono text-xs tracking-[0.14em] text-[var(--hm-primary)]">
                        No. {coupon.couponNumber}
                      </p>
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-[var(--hm-text)]">
                      {coupon.couponName}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--hm-subtext)]">
                      다운로드일 {formatDate(coupon.downloadedAt)}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[20px] font-bold leading-none text-[var(--hm-accent-gold)]">
                      {formatCurrency(coupon.amount)}
                    </p>
                    <p className="mt-2 text-sm text-[var(--hm-subtext)]">
                      {coupon.usedAt
                        ? `사용일시 ${new Date(coupon.usedAt).toLocaleString("ko-KR")}`
                        : `유효기간 ${formatDate(coupon.validUntil)}`}
                    </p>
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
