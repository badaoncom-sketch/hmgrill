import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  Megaphone,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import type { MemberNotificationType } from "@/lib/notifications/db";

export const notificationMeta: Record<
  MemberNotificationType,
  { label: string; icon: LucideIcon }
> = {
  coupon_issued: { label: "쿠폰 발급", icon: Ticket },
  coupon_used: { label: "사용 완료", icon: CheckCircle2 },
  coupon_expiring: { label: "만료 임박", icon: AlarmClock },
  notice: { label: "공지", icon: Megaphone },
  event: { label: "이벤트", icon: CalendarDays },
};
