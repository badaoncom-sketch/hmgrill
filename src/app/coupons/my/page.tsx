import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QrCoupon } from "@/components/qr-coupon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { getEffectiveMemberCouponStatus } from "@/lib/coupon-policy";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";

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
          <section className="mt-12">
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-5">
              <h2 className="hm-subsection-title">사용 가능한 쿠폰</h2>
              <p className="font-mono text-[13px] tracking-[0.12em] text-[var(--hm-accent-gold)]">
                {String(availableCoupons.length).padStart(2, "0")}
              </p>
            </div>
            <div className="mt-8 grid gap-5">
              {availableCoupons.map((coupon) => (
                <QrCoupon key={coupon.id} coupon={coupon} />
              ))}
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
            <div className="mt-8 grid gap-5">
              {pastCoupons.map((coupon) => (
                <QrCoupon key={coupon.id} coupon={coupon} />
              ))}
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
