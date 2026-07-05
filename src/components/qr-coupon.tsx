import Image from "next/image";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div className="grid gap-4">
          <div>
            <Badge tone={isAvailable ? "green" : "neutral"}>
              {statusLabel[effectiveStatus]}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold text-[var(--hm-text)]">
              {coupon.couponName}
            </h2>
            <p className="mt-1 text-xl font-bold text-[var(--hm-accent-gold)]">
              {formatCurrency(coupon.amount)}
            </p>
          </div>
          <dl className="grid gap-2 text-sm text-[var(--hm-subtext)] sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[var(--hm-text)]">사용기간</dt>
              <dd>
                {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
              </dd>
            </div>
            {isAvailable ? (
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">남은 사용기간</dt>
                <dd>{getRemainingDaysText(coupon.validUntil)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="font-semibold text-[var(--hm-text)]">다운로드일</dt>
              <dd>{formatDate(coupon.downloadedAt)}</dd>
            </div>
            {coupon.usedAt ? (
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">사용일시</dt>
                <dd>{new Date(coupon.usedAt).toLocaleString("ko-KR")}</dd>
              </div>
            ) : null}
            {coupon.usedByStaffName ? (
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">사용 직원</dt>
                <dd>{coupon.usedByStaffName}</dd>
              </div>
            ) : null}
          </dl>
          <div className="rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm leading-6 text-[var(--hm-subtext)]">
            <p className="font-semibold text-[var(--hm-text)]">사용조건</p>
            <p className="mt-2 whitespace-pre-line">{coupon.conditionText}</p>
          </div>
          <div className="rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm leading-6 text-[var(--hm-subtext)]">
            <p className="font-semibold">안내사항</p>
            <p className="mt-2 whitespace-pre-line">{coupon.qrNotice}</p>
          </div>
        </div>
        <div className="grid content-start gap-3">
          {isAvailable ? (
            <div className="aspect-square rounded-md border border-[var(--hm-border)] bg-white p-5">
              {/* The QR payload intentionally contains only the opaque coupon token. */}
              <Image
                src={qrDataUrl}
                alt="쿠폰 QR 코드"
                width={280}
                height={280}
                unoptimized
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-5 text-center text-sm font-semibold text-[var(--hm-subtext)]">
              QR 숨김
            </div>
          )}
          <p className="break-all rounded-[14px] bg-[var(--hm-surface)] p-3 text-xs text-[var(--hm-subtext)]">
            토큰: {coupon.token}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
