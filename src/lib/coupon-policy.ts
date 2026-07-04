import type { CouponIssue, MemberCoupon } from "@/lib/types";

type DownloadDecision = {
  allowed: boolean;
  reason: string;
};

export function getRemainingQuantity(issue: CouponIssue) {
  return Math.max(issue.quantity - issue.downloadedCount, 0);
}

export function canDownloadCoupon(
  issue: CouponIssue,
  existingCoupons: MemberCoupon[],
): DownloadDecision {
  if (issue.status !== "issuing") {
    return { allowed: false, reason: "발행종료된 쿠폰입니다." };
  }

  if (getRemainingQuantity(issue) <= 0) {
    return { allowed: false, reason: "발행수량이 모두 소진되었습니다." };
  }

  const couponsForIssue = existingCoupons.filter(
    (coupon) => coupon.issueId === issue.id,
  );
  const availableCoupon = couponsForIssue.find(
    (coupon) => coupon.status === "available",
  );

  if (availableCoupon) {
    return {
      allowed: false,
      reason: "동일한 발행중 쿠폰을 이미 보유하고 있습니다.",
    };
  }

  if (
    issue.redownloadPolicy === "once_per_member" &&
    couponsForIssue.length > 0
  ) {
    return {
      allowed: false,
      reason: "회원당 1회만 다운로드 가능한 쿠폰입니다.",
    };
  }

  if (
    issue.redownloadPolicy === "after_use_allowed" &&
    couponsForIssue.length > 0
  ) {
    const hasUsedCoupon = couponsForIssue.some(
      (coupon) => coupon.status === "used",
    );

    return hasUsedCoupon
      ? { allowed: true, reason: "사용 완료 후 재다운로드 가능합니다." }
      : {
          allowed: false,
          reason: "기존 쿠폰이 사용 완료된 뒤 다시 다운로드할 수 있습니다.",
        };
  }

  return { allowed: true, reason: "다운로드 가능합니다." };
}

export function getQrNotice(issue: CouponIssue) {
  const redownloadNotice =
    issue.redownloadPolicy === "after_use_allowed"
      ? "\n동일 쿠폰은 사용 완료 후 다시 다운로드할 수 있습니다."
      : "";

  return `${issue.qrNotice}${redownloadNotice}`;
}
