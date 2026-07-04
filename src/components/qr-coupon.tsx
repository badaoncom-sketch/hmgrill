import Image from "next/image";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  const isAvailable = coupon.status === "available";
  const qrDataUrl = isAvailable ? await createQrDataUrl(coupon.token) : "";

  return (
    <Card>
      <CardContent className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div className="grid gap-4">
          <div>
            <Badge tone={isAvailable ? "green" : "neutral"}>
              {statusLabel[coupon.status]}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold text-neutral-950">
              {coupon.couponName}
            </h2>
            <p className="mt-1 text-xl font-bold text-red-700">
              {formatCurrency(coupon.amount)}
            </p>
          </div>
          <dl className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-neutral-900">사용기간</dt>
              <dd>
                {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-900">다운로드일</dt>
              <dd>{formatDate(coupon.downloadedAt)}</dd>
            </div>
            {coupon.usedAt ? (
              <div>
                <dt className="font-semibold text-neutral-900">사용일시</dt>
                <dd>{new Date(coupon.usedAt).toLocaleString("ko-KR")}</dd>
              </div>
            ) : null}
            {coupon.usedByStaffName ? (
              <div>
                <dt className="font-semibold text-neutral-900">사용 직원</dt>
                <dd>{coupon.usedByStaffName}</dd>
              </div>
            ) : null}
          </dl>
          <div className="rounded-md bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
            <p className="font-semibold text-neutral-950">사용조건</p>
            <p className="mt-2 whitespace-pre-line">{coupon.conditionText}</p>
          </div>
          <div className="rounded-md bg-red-50 p-4 text-sm leading-6 text-red-950">
            <p className="font-semibold">안내사항</p>
            <p className="mt-2 whitespace-pre-line">{coupon.qrNotice}</p>
          </div>
        </div>
        <div className="grid content-start gap-3">
          {isAvailable ? (
            <div className="aspect-square rounded-lg border border-neutral-300 bg-white p-5">
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
            <div className="grid aspect-square place-items-center rounded-lg border border-neutral-200 bg-neutral-100 p-5 text-center text-sm font-semibold text-neutral-500">
              QR 숨김
            </div>
          )}
          <p className="break-all rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
            토큰: {coupon.token}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
