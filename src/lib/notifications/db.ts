export type MemberNotificationType =
  | "coupon_issued"
  | "coupon_used"
  | "coupon_expiring"
  | "coupon_granted"
  | "coupon_revoked"
  | "notice"
  | "event";

export type MemberNotification = {
  id: string;
  type: MemberNotificationType;
  title: string;
  body: string | null;
  href: string | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};

type MemberNotificationRow = {
  id: string;
  type: MemberNotificationType;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export const memberNotificationSelect =
  "id,type,title,body,href,read_at,archived_at,created_at";

export function mapMemberNotification(row: unknown): MemberNotification {
  const item = row as MemberNotificationRow;

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    href: item.href,
    readAt: item.read_at,
    archivedAt: item.archived_at,
    createdAt: item.created_at,
  };
}
