import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

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
        description="회원별 다운로드, 사용일시, 사용 직원 정보를 확인하는 화면입니다."
      />
      <div className="grid gap-4">
        {memberCoupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge tone={coupon.status === "available" ? "green" : "neutral"}>
                  {coupon.status === "available" ? "사용 가능" : "사용 완료"}
                </Badge>
                <h2 className="mt-3 text-xl font-bold text-neutral-950">
                  {coupon.couponName}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  다운로드일 {formatDate(coupon.downloadedAt)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="font-bold text-red-700">
                  {formatCurrency(coupon.amount)}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {coupon.usedAt
                    ? `사용일시 ${new Date(coupon.usedAt).toLocaleString("ko-KR")}`
                    : "미사용"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {memberCoupons.length === 0 ? (
          <p className="text-sm text-neutral-500">쿠폰 사용내역이 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
