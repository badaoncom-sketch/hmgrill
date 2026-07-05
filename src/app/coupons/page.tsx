import { CouponCard } from "@/components/coupon-card";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import {
  couponIssueSelect,
  mapCouponIssue,
  mapMemberCoupon,
  memberCouponSelect,
} from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";

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
    <main className="hm-page-shell">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="COUPON"
          title="방문 혜택"
          description="화목을 다시 찾는 회원을 위한 혜택입니다. 이메일 인증을 완료하면 사용 가능한 쿠폰을 받을 수 있습니다."
        />
        <div className="flex gap-2">
          <ButtonLink href="/coupons/my" variant="outline">
            내 쿠폰
          </ButtonLink>
          <ButtonLink href="/coupons/history" variant="ghost">
            사용내역
          </ButtonLink>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {couponIssues.map((issue) => (
          <CouponCard
            key={issue.id}
            issue={issue}
            memberCoupons={memberCoupons}
            profileRequired={profileRequired}
            profile={profile}
          />
        ))}
        {couponIssues.length === 0 ? (
          <p className="text-sm text-[var(--hm-subtext)]">현재 제공 중인 혜택이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
