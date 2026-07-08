import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { MyCouponGallery } from "@/components/my-coupon-gallery";
import { QrCoupon } from "@/components/qr-coupon";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import {
  getEffectiveMemberCouponStatus,
  getRemainingDaysText,
} from "@/lib/coupon-policy";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "내 쿠폰",
  description: "방문 시 사용할 수 있는 회원 혜택과 QR 쿠폰 상태를 확인합니다.",
};

export default async function MyCouponsPage() {
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
  const memberCoupons = (rows ?? []).map(mapMemberCoupon);
  const availableCoupons = memberCoupons.filter(
    (coupon) => getEffectiveMemberCouponStatus(coupon) === "available",
  );
  const pastCoupons = memberCoupons.filter(
    (coupon) => getEffectiveMemberCouponStatus(coupon) !== "available",
  );

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">My Coupon</p>
            <h1 className="hm-section-title mt-5">내 쿠폰</h1>
            <p className="hm-body mt-5 text-[var(--hm-subtext)]">
              방문 시 사용할 수 있는 회원 혜택과 QR 쿠폰 상태를 확인합니다.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <ButtonLink href="/coupons" variant="outline">
              쿠폰 받기
            </ButtonLink>
            <ButtonLink href="/coupons/history" variant="ghost">
              사용내역
            </ButtonLink>
          </div>
        </div>

        {availableCoupons.length > 0 ? (
          <section className="mt-8 md:mt-12">
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-4 md:pb-5">
              <h2 className="hm-subsection-title">사용 가능한 쿠폰</h2>
              <p className="font-mono text-[13px] tracking-[0.12em] text-[var(--hm-accent-gold)]">
                {String(availableCoupons.length).padStart(2, "0")}
              </p>
            </div>
            <div className="mt-5 md:mt-8">
              <MyCouponGallery
                items={availableCoupons.map((coupon) => ({
                  id: coupon.id,
                  name: coupon.couponName,
                  amountText: formatCurrency(coupon.amount),
                  remainingText: `${getRemainingDaysText(coupon.validUntil)} · ${formatDate(coupon.validUntil)}까지`,
                  couponNumber: coupon.couponNumber,
                  detail: <QrCoupon coupon={coupon} />,
                }))}
              />
            </div>
          </section>
        ) : null}

        {pastCoupons.length > 0 ? (
          <section className="mt-14">
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-5">
              <h2 className="hm-subsection-title">지난 쿠폰</h2>
              <p className="font-mono text-[13px] tracking-[0.12em] text-[var(--hm-accent-gold)]">
                {String(pastCoupons.length).padStart(2, "0")}
              </p>
            </div>
            <div className="mt-6 overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
              <div className="divide-y divide-[var(--hm-divider)]">
                {pastCoupons.map((coupon) => {
                  const status = getEffectiveMemberCouponStatus(coupon);
                  return (
                    <details key={coupon.id} className="group">
                      <summary className="hm-link-focus flex cursor-pointer list-none items-center gap-3 p-4 transition hover:bg-white/[0.03] sm:px-6 [&::-webkit-details-marker]:hidden">
                        <Badge tone={status === "used" ? "neutral" : "red"}>
                          {status === "used" ? "사용 완료" : "기간 만료"}
                        </Badge>
                        <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-white/75">
                          {coupon.couponName}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-[var(--hm-accent-gold)]/85">
                          {formatCurrency(coupon.amount)}
                        </span>
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-white/35 transition group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <dl className="grid gap-x-8 gap-y-3 border-t border-[var(--hm-divider)] bg-black/20 p-4 text-sm sm:grid-cols-2 sm:px-6">
                        <div>
                          <dt className="text-xs font-bold text-white/40">쿠폰번호</dt>
                          <dd className="mt-1 font-mono text-[13px] tracking-[0.12em] text-[var(--hm-primary)]">
                            {coupon.couponNumber}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold text-white/40">사용기간</dt>
                          <dd className="mt-1 text-[var(--hm-subtext)]">
                            {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold text-white/40">다운로드일</dt>
                          <dd className="mt-1 text-[var(--hm-subtext)]">
                            {formatDate(coupon.downloadedAt)}
                          </dd>
                        </div>
                        {coupon.usedAt ? (
                          <div>
                            <dt className="text-xs font-bold text-white/40">사용일시</dt>
                            <dd className="mt-1 text-[var(--hm-subtext)]">
                              {new Date(coupon.usedAt).toLocaleString("ko-KR")}
                            </dd>
                          </div>
                        ) : null}
                        {coupon.usedByStaffName ? (
                          <div>
                            <dt className="text-xs font-bold text-white/40">처리 직원</dt>
                            <dd className="mt-1 text-[var(--hm-subtext)]">
                              {coupon.usedByStaffName}
                            </dd>
                          </div>
                        ) : null}
                        {coupon.conditionText ? (
                          <div className="sm:col-span-2">
                            <dt className="text-xs font-bold text-white/40">사용조건</dt>
                            <dd className="mt-1 whitespace-pre-line text-[13px] leading-6 text-[var(--hm-subtext)]">
                              {coupon.conditionText}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </details>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {memberCoupons.length === 0 ? (
          <div className="mt-12 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              다운로드한 쿠폰이 없습니다. 발행 중인 방문 혜택을 확인해 보세요.
            </p>
            <ButtonLink href="/coupons" className="mt-6">
              쿠폰 받으러 가기
            </ButtonLink>
          </div>
        ) : null}
      </Container>
    </main>
  );
}
