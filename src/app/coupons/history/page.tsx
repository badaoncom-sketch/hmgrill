import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { memberCoupons } from "@/lib/site-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CouponHistoryPage() {
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
      </div>
    </main>
  );
}
