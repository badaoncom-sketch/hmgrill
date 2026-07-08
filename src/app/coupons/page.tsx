import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { CouponCard } from "@/components/coupon-card";
import { CouponShowcase, type ShowcaseCoupon } from "@/components/coupon-showcase";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { getRemainingQuantity } from "@/lib/coupon-policy";
import {
  couponIssueSelect,
  mapCouponIssue,
  mapMemberCoupon,
  memberCouponSelect,
} from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "쿠폰",
  description: "화목을 다시 찾는 회원을 위한 방문 혜택입니다.",
};

const usageSteps = [
  {
    number: "01",
    title: "쿠폰 다운로드",
    body: "최초 1회만 수령 정보(이름·연락처·주소)를 입력하면, 다음부터는 클릭 한 번으로 바로 받을 수 있습니다.",
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
  const [{ data: issueRows }, { data: endedRows }] = await Promise.all([
    supabase
      .from("coupon_issues")
      .select(couponIssueSelect)
      .eq("status", "issuing")
      .order("created_at", { ascending: false }),
    supabase
      .from("coupon_issues")
      .select(couponIssueSelect)
      .eq("status", "ended")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);
  const { data: memberCouponRows } = user
    ? await supabase
        .from("member_coupons")
        .select(memberCouponSelect)
        .eq("member_id", user.id)
    : { data: [] };
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("name,phone,address,privacy_accepted_at,marketing_accepted_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const couponIssues = (issueRows ?? []).map(mapCouponIssue);
  const endedIssues = (endedRows ?? []).map(mapCouponIssue);
  const memberCoupons = (memberCouponRows ?? []).map(mapMemberCoupon);
  const profileRequired = Boolean(
    user &&
      (!profile?.name?.trim() ||
        !profile?.phone?.trim() ||
        !profile?.address?.trim() ||
        !profile?.privacy_accepted_at),
  );

  // 아직 받지 않은 쿠폰을 위, 이미 받은 쿠폰을 아래에 배치한다.
  const receivedIssueIds = new Set(memberCoupons.map((coupon) => coupon.issueId));
  const newIssues = couponIssues.filter((issue) => !receivedIssueIds.has(issue.id));
  const receivedIssues = couponIssues.filter((issue) => receivedIssueIds.has(issue.id));

  const renderCard = (
    issue: (typeof couponIssues)[number],
    conditionsOpen = false,
  ) => (
    <CouponCard
      issue={issue}
      memberCoupons={memberCoupons}
      isGuest={!user}
      profileRequired={profileRequired}
      marketingConsented={Boolean(profile?.marketing_accepted_at)}
      profile={profile}
      conditionsOpen={conditionsOpen}
    />
  );

  const toShowcaseItem = (
    issue: (typeof couponIssues)[number],
    received: boolean,
  ): ShowcaseCoupon => {
    const remaining = getRemainingQuantity(issue);
    return {
      id: issue.id,
      name: issue.name,
      amountText: formatCurrency(issue.amount),
      caption: `다운로드 후 ${issue.validityDays}일 · 남은 ${remaining}장`,
      lowStock: remaining <= Math.max(5, Math.ceil(issue.quantity * 0.1)),
      received,
      detail: renderCard(issue, true),
    };
  };

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">Coupon</p>
            <h1 className="hm-section-title mt-3 md:mt-5">방문 혜택</h1>
            <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">
              화목을 다시 찾는 회원을 위한 혜택입니다. 최초 1회 수령 정보만
              입력해 두면 새 쿠폰이 나올 때마다 바로 받을 수 있습니다.
            </p>
          </div>
          {user ? (
            <div className="flex shrink-0 gap-2">
              <ButtonLink href="/coupons/my" variant="outline">
                내 쿠폰
              </ButtonLink>
              <ButtonLink href="/coupons/history" variant="ghost">
                사용내역
              </ButtonLink>
            </div>
          ) : null}
        </div>

        {!user ? (
          <div className="mt-7 flex flex-col gap-4 rounded-[20px] border border-[rgba(247,230,193,.2)] bg-[radial-gradient(60%_120%_at_50%_0%,rgba(184,130,30,.09),transparent_70%),var(--hm-surface)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 md:mt-10">
            <div>
              <p className="text-[16px] font-bold text-[var(--hm-primary)]">
                로그인하면 쿠폰을 바로 받을 수 있어요
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--hm-subtext)]">
                회원가입 후 이메일 인증만 마치면 발행 중인 방문 혜택이 열립니다.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <ButtonLink href="/login">로그인</ButtonLink>
              <ButtonLink href="/signup" variant="outline">
                회원가입
              </ButtonLink>
            </div>
          </div>
        ) : null}

        {couponIssues.length > 0 ? (
          <>
            {/* 모바일·태블릿: 한눈에 보는 썸네일 그리드 + 시트 상세 */}
            <div className="mt-7 lg:hidden">
              <CouponShowcase
                newItems={newIssues.map((issue) => toShowcaseItem(issue, false))}
                receivedItems={receivedIssues.map((issue) => toShowcaseItem(issue, true))}
              />
            </div>

            {/* 데스크톱: 티켓 카드 — 미발급 상단, 발급받은 쿠폰 하단 */}
            <div className="mt-10 hidden lg:block">
              {newIssues.length > 0 ? (
                <div
                  className={`grid gap-5 ${
                    newIssues.length > 1 ? "xl:grid-cols-2" : "xl:max-w-3xl"
                  }`}
                >
                  {newIssues.map((issue) => (
                    <div key={issue.id}>{renderCard(issue)}</div>
                  ))}
                </div>
              ) : null}
              {receivedIssues.length > 0 ? (
                <section className={newIssues.length > 0 ? "mt-12" : ""}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-4">
                    <h2 className="text-[17px] font-bold text-white/70">
                      이미 받은 쿠폰
                    </h2>
                    <Link
                      href="/coupons/my"
                      className="hm-link-focus text-sm font-bold text-[var(--hm-accent-gold)] transition hover:text-[var(--hm-primary)]"
                    >
                      내 쿠폰에서 QR 보기
                    </Link>
                  </div>
                  <div
                    className={`mt-6 grid gap-5 ${
                      receivedIssues.length > 1 ? "xl:grid-cols-2" : "xl:max-w-3xl"
                    }`}
                  >
                    {receivedIssues.map((issue) => (
                      <div key={issue.id}>{renderCard(issue)}</div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[rgba(247,230,193,.2)] text-[var(--hm-accent-gold)]">
              <Ticket size={24} aria-hidden="true" />
            </span>
            <p className="mt-5 text-[16px] font-bold text-white/80">
              지금은 발행 중인 쿠폰이 없습니다
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--hm-subtext)]">
              새로운 혜택은 이벤트 소식과 함께 가장 먼저 안내됩니다.
            </p>
            <ButtonLink href="/events" variant="outline" className="mt-6">
              이벤트 소식 보기
              <ArrowRight size={15} aria-hidden="true" />
            </ButtonLink>
          </div>
        )}

        {endedIssues.length > 0 ? (
          <section className="mt-14">
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-5">
              <h2 className="hm-subsection-title">마감된 혜택</h2>
              <p className="font-mono text-[13px] tracking-[0.12em] text-[var(--hm-accent-gold)]">
                {String(endedIssues.length).padStart(2, "0")}
              </p>
            </div>
            <div className="mt-6 overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
              <div className="divide-y divide-[var(--hm-divider)]">
                {endedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-3 px-5 py-4 opacity-65 sm:px-6"
                  >
                    <Badge tone="neutral">마감</Badge>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-white/70">
                      {issue.name}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-white/45">
                      {formatCurrency(issue.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-12 border-t border-[var(--hm-warm-border)] pt-8 md:mt-16 md:pt-12 lg:mt-20">
          <p className="hm-eyebrow">How to use</p>
          <h2 className="hm-subsection-title mt-3 md:mt-4">쿠폰 이용 방법</h2>
          <div className="mt-6 grid gap-y-5 md:mt-10 md:grid-cols-3 md:gap-x-10 md:gap-y-10">
            {usageSteps.map((step) => (
              <article
                key={step.number}
                className="flex gap-4 border-t border-[var(--hm-border)] pt-5 transition-colors duration-300 hover:border-[rgba(247,230,193,.34)] md:block md:pt-6"
              >
                <p className="w-7 shrink-0 pt-1 font-mono text-[13px] tracking-[0.16em] text-[var(--hm-accent-gold)] md:w-auto md:pt-0">
                  {step.number}
                </p>
                <div className="min-w-0">
                  <h3 className="hm-serif text-[17px] font-semibold leading-[1.3] text-[var(--hm-primary)] md:mt-4 md:text-[21px]">
                    {step.title}
                  </h3>
                  <p className="hm-caption mt-1.5 text-[var(--hm-subtext)] md:mt-3">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
