import type { Metadata } from "next";
import QRCode from "qrcode";
import { CheckCircle2, TicketX, TimerOff } from "lucide-react";
import { GuestCouponActions } from "@/components/guest-coupon-actions";
import { QrCoupon } from "@/components/qr-coupon";
import { Container } from "@/components/ui/layout";
import { getEffectiveMemberCouponStatus } from "@/lib/coupon-policy";
import { mapMemberCoupon, memberCouponSelect } from "@/lib/coupons/db";
import { getSiteUrl } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "화목 감사쿠폰",
  robots: { index: false, follow: false },
};

// 비회원 소지자 쿠폰 페이지 — 링크(토큰)를 아는 사람이 쿠폰의 소유자다.
export default async function GuestCouponPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("member_coupons")
    .select(memberCouponSelect)
    .eq("token", token)
    .eq("source", "guest_claim")
    .maybeSingle();

  if (!row) {
    return (
      <main className="hm-page-main">
        <Container>
          <div className="mx-auto max-w-md py-16 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--hm-border)] text-white/40">
              <TicketX size={28} aria-hidden="true" />
            </span>
            <h1 className="hm-subsection-title mt-6">쿠폰을 찾을 수 없습니다</h1>
            <p className="hm-body mt-3 text-[var(--hm-subtext)]">
              링크가 정확한지 확인해 주세요.
            </p>
          </div>
        </Container>
      </main>
    );
  }

  const coupon = mapMemberCoupon(row);
  const status = getEffectiveMemberCouponStatus(coupon);
  const qrDataUrl =
    status === "available"
      ? await QRCode.toDataURL(coupon.token, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 320,
          color: { dark: "#171717", light: "#ffffff" },
        })
      : "";

  return (
    <main className="hm-page-main">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="hm-eyebrow">Hwamok Thank You Coupon</p>
            <h1 className="hm-subsection-title mt-3">화목 감사쿠폰</h1>
            <p className="hm-caption mt-2 text-[var(--hm-subtext)]">
              {status === "available"
                ? "방문 시 아래 QR을 직원에게 보여주세요. 스크린샷·저장한 이미지도 그대로 사용할 수 있습니다."
                : "이 쿠폰의 사용 상태를 안내해 드립니다."}
            </p>
          </div>

          {status === "used" ? (
            <div className="mt-5 flex items-center gap-3.5 rounded-[18px] border border-[rgba(52,211,153,.35)] bg-[rgba(16,185,129,.08)] p-4">
              <CheckCircle2 size={26} className="shrink-0 text-emerald-300" aria-hidden="true" />
              <div>
                <p className="text-[15px] font-bold text-emerald-200">
                  사용 완료된 쿠폰입니다
                </p>
                <p className="mt-0.5 text-xs leading-5 text-white/60">
                  방문해 주셔서 감사합니다. 다음 방문 때 또 새로운 혜택으로
                  인사드릴게요!
                </p>
              </div>
            </div>
          ) : null}
          {status === "expired" ? (
            <div className="mt-5 flex items-center gap-3.5 rounded-[18px] border border-[rgba(198,59,45,.4)] bg-[rgba(198,59,45,.08)] p-4">
              <TimerOff size={26} className="shrink-0 text-[#f0a39b]" aria-hidden="true" />
              <div>
                <p className="text-[15px] font-bold text-[#f0a39b]">
                  유효기간이 만료된 쿠폰입니다
                </p>
                <p className="mt-0.5 text-xs leading-5 text-white/60">
                  아쉽지만 이 쿠폰은 더 이상 사용할 수 없습니다. 다음 방문 때
                  계산대에서 새 감사쿠폰을 받아 주세요.
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <QrCoupon coupon={coupon} />
          </div>

          {status === "available" ? (
            <GuestCouponActions
              couponName={coupon.couponName}
              amountText={formatCurrency(coupon.amount)}
              couponNumber={coupon.couponNumber}
              validUntilText={`${formatDate(coupon.validUntil)}까지`}
              conditionText={coupon.conditionText}
              qrDataUrl={qrDataUrl}
              shareUrl={`${getSiteUrl()}/c/${coupon.token}`}
            />
          ) : null}

          {status === "available" ? (
            <p className="mt-8 text-center text-xs leading-6 text-white/40">
              이 링크가 곧 쿠폰입니다 — 잃어버리지 않게 이미지 저장 또는
              카카오톡 공유로 보관해 주세요.
              <br />
              쿠폰번호 {coupon.couponNumber}만 알아도 매장에서 사용할 수 있습니다.
            </p>
          ) : (
            <p className="mt-8 text-center text-xs leading-6 text-white/40">
              화목을 찾아 주셔서 감사합니다. 새 혜택은 방문 시 계산대에서
              안내해 드립니다.
            </p>
          )}
        </div>
      </Container>
    </main>
  );
}
