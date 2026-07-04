import type {
  CouponIssue,
  CouponRedownloadPolicy,
  CouponUseFlow,
  MemberCoupon,
} from "@/lib/types";

type CouponIssueRow = {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  downloaded_count: number;
  used_count: number;
  expired_count: number;
  validity_days: number;
  condition_text: string | null;
  qr_notice: string;
  redownload_policy: CouponRedownloadPolicy;
  use_flow: CouponUseFlow;
  status: "issuing" | "ended";
  end_reason: "quantity_sold_out" | "admin_stopped" | null;
};

type MemberCouponRow = {
  id: string;
  issue_id: string;
  token: string;
  downloaded_at: string;
  valid_from: string;
  valid_until: string;
  status: "available" | "used" | "expired";
  used_at: string | null;
  coupon_issues:
    | {
        name: string;
        amount: number;
        condition_text: string | null;
        qr_notice: string;
      }
    | {
        name: string;
        amount: number;
        condition_text: string | null;
        qr_notice: string;
      }[]
    | null;
  profiles:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export const couponIssueSelect = [
  "id",
  "name",
  "amount",
  "quantity",
  "downloaded_count",
  "used_count",
  "expired_count",
  "validity_days",
  "condition_text",
  "qr_notice",
  "redownload_policy",
  "use_flow",
  "status",
  "end_reason",
].join(",");

export const memberCouponSelect = [
  "id",
  "issue_id",
  "token",
  "downloaded_at",
  "valid_from",
  "valid_until",
  "status",
  "used_at",
  "coupon_issues(name,amount,condition_text,qr_notice)",
  "profiles!member_coupons_used_by_staff_id_fkey(name)",
].join(",");

export function mapCouponIssue(row: unknown): CouponIssue {
  const item = row as CouponIssueRow;

  return {
    id: item.id,
    name: item.name,
    amount: item.amount,
    quantity: item.quantity,
    downloadedCount: item.downloaded_count,
    usedCount: item.used_count,
    expiredCount: item.expired_count,
    validityDays: item.validity_days,
    conditionText: item.condition_text ?? "",
    qrNotice: item.qr_notice,
    redownloadPolicy: item.redownload_policy,
    useFlow: item.use_flow,
    status: item.status,
    endReason: item.end_reason ?? undefined,
  };
}

export function mapMemberCoupon(row: unknown): MemberCoupon {
  const item = row as MemberCouponRow;
  const issue = Array.isArray(item.coupon_issues)
    ? item.coupon_issues[0]
    : item.coupon_issues;
  const staff = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;

  return {
    id: item.id,
    issueId: item.issue_id,
    token: item.token,
    couponName: issue?.name ?? "쿠폰",
    amount: issue?.amount ?? 0,
    memberName: "",
    downloadedAt: item.downloaded_at,
    validFrom: item.valid_from,
    validUntil: item.valid_until,
    status: item.status,
    usedAt: item.used_at ?? undefined,
    usedByStaffName: staff?.name,
    conditionText: issue?.condition_text ?? "",
    qrNotice: issue?.qr_notice ?? "",
  };
}
