export type UserRole = "member" | "staff" | "admin";

export type CouponIssueStatus = "issuing" | "ended";

export type CouponEndReason = "quantity_sold_out" | "admin_stopped";

export type CouponRedownloadPolicy =
  | "after_use_allowed"
  | "once_per_member";

export type CouponUseFlow = "auto_complete" | "staff_confirm";

export type MemberCouponStatus = "available" | "used" | "expired";

export type CouponIssue = {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  downloadedCount: number;
  usedCount: number;
  expiredCount: number;
  validityDays: number;
  conditionText: string;
  qrNotice: string;
  redownloadPolicy: CouponRedownloadPolicy;
  useFlow: CouponUseFlow;
  status: CouponIssueStatus;
  endReason?: CouponEndReason;
};

export type MemberCoupon = {
  id: string;
  issueId: string;
  token: string;
  couponName: string;
  amount: number;
  memberName: string;
  downloadedAt: string;
  validFrom: string;
  validUntil: string;
  status: MemberCouponStatus;
  usedAt?: string;
  usedByStaffName?: string;
  conditionText: string;
  qrNotice: string;
};

export type MenuItem = {
  id: string;
  category: "대표메뉴" | "전체메뉴" | "세트메뉴" | "사이드" | "음료";
  name: string;
  description: string;
  price: number;
  featured?: boolean;
};
