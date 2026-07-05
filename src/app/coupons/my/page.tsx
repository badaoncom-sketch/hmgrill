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
    <main className="hm-page-shell">
      <SectionHeading
        eyebrow="MY COUPON"
        title="내 쿠폰"
        description="방문 시 사용할 수 있는 회원 혜택과 QR 쿠폰 상태를 확인합니다."
      />
      <div className="grid gap-5">
        {memberCoupons.map((coupon) => (
          <QrCoupon key={coupon.id} coupon={coupon} />
        ))}
        {memberCoupons.length === 0 ? (
          <p className="text-sm text-[var(--hm-subtext)]">다운로드한 쿠폰이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
