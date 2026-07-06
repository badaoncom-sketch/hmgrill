export type UserRole = "member" | "staff" | "admin";

export type AdminNotificationTone = "amber" | "red" | "green";

export type AdminNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone?: AdminNotificationTone;
  category?: string;
  createdAt?: string;
};

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
  couponNumber: string;
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

export type CouponEvent = {
  id: string;
  eventType: string;
  actorName?: string;
  actorEmail?: string;
  memberCouponId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type MenuItem = {
  id: string;
  category: "대표메뉴" | "전체메뉴" | "세트메뉴" | "사이드" | "음료";
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  featured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export type ContentPostType = "event" | "notice";

export type ContentStatus = "draft" | "published" | "archived";

export type ContentPost = {
  id: string;
  type: ContentPostType;
  title: string;
  body: string;
  status: ContentStatus;
  publishedAt?: string;
  startsAt?: string;
  endsAt?: string;
  sortOrder: number;
  createdAt: string;
};

export type InquiryStatus = "open" | "answered" | "closed";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: InquiryStatus;
  adminNote?: string;
  answeredAt?: string;
  createdAt: string;
};

export type SiteBanner = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  href?: string;
  placement: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  sortOrder: number;
};

export type SitePopup = {
  id: string;
  title: string;
  body: string;
  href?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  sortOrder: number;
};
