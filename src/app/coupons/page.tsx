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
          title="쿠폰 다운로드"
          description="발행중 쿠폰만 회원 다운로드 목록에 표시합니다. 이메일 인증 전에는 실제 다운로드가 제한됩니다."
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
          <p className="text-sm text-neutral-500">현재 발행중인 쿠폰이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
