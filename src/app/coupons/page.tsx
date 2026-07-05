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
  const couponIssues = (issueRows ?? []).map(mapCouponIssue);
  const memberCoupons = (memberCouponRows ?? []).map(mapMemberCoupon);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
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
          />
        ))}
        {couponIssues.length === 0 ? (
          <p className="text-sm text-[#8a7c6d]">현재 제공 중인 혜택이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
