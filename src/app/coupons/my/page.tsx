import { QrCoupon } from "@/components/qr-coupon";
import { SectionHeading } from "@/components/section-heading";
import { memberCoupons } from "@/lib/site-data";

export default function MyCouponsPage() {
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
      </div>
    </main>
  );
}
