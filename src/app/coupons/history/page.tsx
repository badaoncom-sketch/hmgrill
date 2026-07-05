import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getEffectiveMemberCouponStatus } from "@/lib/coupon-policy";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels = {
  available: "사용 가능",
  used: "사용 완료",
  expired: "기간 만료",
};

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
  const memberCoupons = (rows ?? []).map(mapMemberCoupon);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="HISTORY"
        title="쿠폰 사용내역"
        description="받은 혜택의 사용 가능 여부, 사용일시, 만료 상태를 확인합니다."
      />
      <div className="grid gap-4">
        {memberCoupons.map((coupon) => {
          const effectiveStatus = getEffectiveMemberCouponStatus(coupon);

          return (
            <Card key={coupon.id}>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge tone={statusTones[effectiveStatus]}>
                    {statusLabels[effectiveStatus]}
                  </Badge>
                  <h2 className="mt-3 text-xl font-bold text-[#17130f]">
                    {coupon.couponName}
                  </h2>
                  <p className="mt-1 text-sm text-[#5f554a]">
                    다운로드일 {formatDate(coupon.downloadedAt)}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-bold text-[#B13A1E]">
                    {formatCurrency(coupon.amount)}
                  </p>
                  <p className="mt-1 text-sm text-[#8a7c6d]">
                    {coupon.usedAt
                      ? `사용일시 ${new Date(coupon.usedAt).toLocaleString("ko-KR")}`
                      : `유효기간 ${formatDate(coupon.validUntil)}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {memberCoupons.length === 0 ? (
          <p className="text-sm text-[#8a7c6d]">쿠폰 사용내역이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
