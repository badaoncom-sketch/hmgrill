import type { Metadata } from "next";
import { CouponCard } from "@/components/coupon-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import {
  couponIssueSelect,
  mapCouponIssue,
  mapMemberCoupon,
  memberCouponSelect,
} from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "쿠폰",
  description: "화목을 다시 찾는 회원을 위한 방문 혜택입니다.",
};

const usageSteps = [
  {
    number: "01",
    title: "쿠폰 다운로드",
    body: "이메일 인증을 마친 회원이라면 발행 중인 쿠폰을 바로 받을 수 있습니다.",
  },
  {
    number: "02",
    title: "매장에서 QR 제시",
    body: "결제 전에 내 쿠폰 화면의 QR코드를 직원에게 보여 주세요.",
  },
  {
    number: "03",
    title: "직원 확인 후 할인",
    body: "직원이 사용완료 처리를 마치면 결제 금액에서 할인이 적용됩니다.",
  },
];

export default async function CouponsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: issueRows } = await supabase
    .from("coupon_issues")
    .select(couponIssueSelect)
    .eq("status", "issuing")
    .order("created_at", { ascending: false });
  const { data: memberCouponRows } = user
    ? await supabase
        .from("member_coupons")
        .select(memberCouponSelect)
        .eq("member_id", user.id)
    : { data: [] };
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("name,phone,address,privacy_accepted_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const couponIssues = (issueRows ?? []).map(mapCouponIssue);
  const memberCoupons = (memberCouponRows ?? []).map(mapMemberCoupon);
  const profileRequired = Boolean(
    user &&
      (!profile?.name?.trim() ||
        !profile?.phone?.trim() ||
        !profile?.address?.trim() ||
        !profile?.privacy_accepted_at),
  );

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">Coupon</p>
            <h1 className="hm-section-title mt-5">방문 혜택</h1>
            <p className="hm-body mt-5 text-[var(--hm-subtext)]">
              화목을 다시 찾는 회원을 위한 혜택입니다. 이메일 인증을 완료하면
              사용 가능한 쿠폰을 받을 수 있습니다.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <ButtonLink href="/coupons/my" variant="outline">
              내 쿠폰
            </ButtonLink>
            <ButtonLink href="/coupons/history" variant="ghost">
              사용내역
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {couponIssues.map((issue) => (
            <CouponCard
              key={issue.id}
              issue={issue}
              memberCoupons={memberCoupons}
              profileRequired={profileRequired}
              profile={profile}
            />
          ))}
        </div>
        {couponIssues.length === 0 ? (
          <div className="mt-12 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              현재 제공 중인 혜택이 없습니다. 새로운 소식은 이벤트 페이지에서 확인해 주세요.
            </p>
          </div>
        ) : null}

        <section className="mt-16 border-t border-[var(--hm-warm-border)] pt-12 lg:mt-20">
          <p className="hm-eyebrow">How to use</p>
          <h2 className="hm-subsection-title mt-4">쿠폰 이용 방법</h2>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {usageSteps.map((step) => (
              <article
                key={step.number}
                className="border-t border-[var(--hm-border)] pt-6 transition-colors duration-300 hover:border-[rgba(247,230,193,.34)]"
              >
                <p className="font-mono text-[13px] tracking-[0.16em] text-[var(--hm-accent-gold)]">
                  {step.number}
                </p>
                <h3 className="hm-serif mt-4 text-[21px] font-semibold leading-[1.3] text-[var(--hm-primary)]">
                  {step.title}
                </h3>
                <p className="hm-caption mt-3 text-[var(--hm-subtext)]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
