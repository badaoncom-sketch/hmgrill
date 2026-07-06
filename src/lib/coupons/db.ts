import type {
  CouponIssue,
  CouponEvent,
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
  coupon_number: string;
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
  member_profile:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
  staff_profile:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

type CouponEventRow = {
  id: string;
  event_type: string;
  member_coupon_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_profile:
    | {
        name: string | null;
        email: string;
      }
    | {
        name: string | null;
        email: string;
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
  "coupon_number",
  "downloaded_at",
  "valid_from",
  "valid_until",
  "status",
  "used_at",
  "coupon_issues(name,amount,condition_text,qr_notice)",
  "member_profile:profiles!member_coupons_member_id_fkey(name)",
  "staff_profile:profiles!member_coupons_used_by_staff_id_fkey(name)",
].join(",");

export const couponEventSelect = [
  "id",
  "event_type",
  "member_coupon_id",
  "metadata",
  "created_at",
  "actor_profile:profiles!coupon_events_actor_id_fkey(name,email)",
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
  const member = Array.isArray(item.member_profile)
    ? item.member_profile[0]
    : item.member_profile;
  const staff = Array.isArray(item.staff_profile)
    ? item.staff_profile[0]
    : item.staff_profile;

  return {
    id: item.id,
    issueId: item.issue_id,
    token: item.token,
    couponNumber: item.coupon_number,
    couponName: issue?.name ?? "쿠폰",
    amount: issue?.amount ?? 0,
    memberName: member?.name ?? "",
    downloadedAt: item.downloaded_at,
    validFrom: item.valid_from,
    validUntil: item.valid_until,
    status: item.status,
    usedAt: item.used_at ?? undefined,
    usedByStaffName: staff?.name ?? undefined,
    conditionText: issue?.condition_text ?? "",
    qrNotice: issue?.qr_notice ?? "",
  };
}

export function mapCouponEvent(row: unknown): CouponEvent {
  const item = row as CouponEventRow;
  const actor = Array.isArray(item.actor_profile)
    ? item.actor_profile[0]
    : item.actor_profile;

  return {
    id: item.id,
    eventType: item.event_type,
    actorName: actor?.name ?? undefined,
    actorEmail: actor?.email,
    memberCouponId: item.member_coupon_id ?? undefined,
    metadata: item.metadata,
    createdAt: item.created_at,
  };
}
