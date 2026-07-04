import { redirect } from "next/navigation";
import { QrCoupon } from "@/components/qr-coupon";
import { SectionHeading } from "@/components/section-heading";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="MY COUPON"
        title="내 쿠폰"
        description="사용 가능, 사용 완료, 기간 만료 상태별 표시 기준을 반영한 회원 쿠폰 화면입니다."
      />
      <div className="grid gap-5">
        {memberCoupons.map((coupon) => (
          <QrCoupon key={coupon.id} coupon={coupon} />
        ))}
        {memberCoupons.length === 0 ? (
          <p className="text-sm text-neutral-500">다운로드한 쿠폰이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
