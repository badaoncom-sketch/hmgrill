import Image from "next/image";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import {
  getEffectiveMemberCouponStatus,
  getRemainingDaysText,
} from "@/lib/coupon-policy";
import type { MemberCoupon } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabel = {
  available: "사용 가능",
  used: "사용 완료",
  expired: "기간 만료",
};

async function createQrDataUrl(token: string) {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 280,
    color: {
      dark: "#171717",
      light: "#ffffff",
    },
  });
}

export async function QrCoupon({ coupon }: { coupon: MemberCoupon }) {
  const effectiveStatus = getEffectiveMemberCouponStatus(coupon);
  const isAvailable = effectiveStatus === "available";
  const qrDataUrl = isAvailable ? await createQrDataUrl(coupon.token) : "";

  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-[var(--hm-surface)] ${
        isAvailable
          ? "border-[rgba(247,230,193,.22)] shadow-[var(--hm-shadow)]"
          : "border-[var(--hm-border)] opacity-75"
      }`}
    >
      <div className="grid md:grid-cols-[1fr_270px]">
        <div className="p-7 lg:p-8">
          <Badge tone={isAvailable ? "green" : "neutral"}>
            {statusLabel[effectiveStatus]}
          </Badge>
          <h2 className="mt-4 text-[22px] font-bold leading-snug text-[var(--hm-text)]">
            {coupon.couponName}
          </h2>
          <p className="mt-2 text-[26px] font-bold leading-none text-[var(--hm-accent-gold)]">
            {formatCurrency(coupon.amount)}
          </p>

          <dl className="mt-7 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--hm-text)]">사용기간</dt>
              <dd className="mt-1 text-[var(--hm-subtext)]">
                {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
              </dd>
            </div>
            {isAvailable ? (
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">남은 사용기간</dt>
                <dd className="mt-1 text-[var(--hm-subtext)]">
                  {getRemainingDaysText(coupon.validUntil)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold text-[var(--hm-text)]">다운로드일</dt>
              <dd className="mt-1 text-[var(--hm-subtext)]">
                {formatDate(coupon.downloadedAt)}
              </dd>
            </div>
            {coupon.usedAt ? (
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">사용일시</dt>
                <dd className="mt-1 text-[var(--hm-subtext)]">
                  {new Date(coupon.usedAt).toLocaleString("ko-KR")}
                </dd>
              </div>
            ) : null}
            {coupon.usedByStaffName ? (
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">사용 직원</dt>
                <dd className="mt-1 text-[var(--hm-subtext)]">{coupon.usedByStaffName}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-7 rounded-[14px] border border-[var(--hm-border)] bg-black/20 p-4 text-sm leading-6 text-[var(--hm-subtext)]">
            <p className="font-semibold text-[var(--hm-text)]">사용조건</p>
            <p className="mt-2 whitespace-pre-line">{coupon.conditionText}</p>
          </div>
        </div>

        <div className="relative grid content-center gap-5 border-t border-dashed border-white/[0.14] p-7 md:border-l md:border-t-0">
          <span
            aria-hidden="true"
            className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-[var(--hm-background)] md:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-[var(--hm-background)] md:block"
          />

          {isAvailable ? (
            <div className="mx-auto w-full max-w-[220px] rounded-[16px] bg-white p-4">
              {/* The QR payload intentionally contains only the opaque coupon token. */}
              <Image
                src={qrDataUrl}
                alt="쿠폰 QR 코드"
                width={280}
                height={280}
                unoptimized
                className="h-auto w-full object-contain"
              />
            </div>
          ) : (
            <div className="mx-auto grid aspect-square w-full max-w-[220px] place-items-center rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-card)] text-sm font-semibold text-[var(--hm-subtext)]">
              QR 숨김
            </div>
          )}
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/36">
              Coupon No.
            </p>
            <p className="mt-1.5 font-mono text-[15px] font-semibold tracking-[0.16em] text-[var(--hm-primary)]">
              {coupon.couponNumber}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
