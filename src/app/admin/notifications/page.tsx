import { AdminFrame, AdminPanel } from "@/components/admin/admin-frame";
import { AdminNotificationInbox } from "@/components/admin/admin-notification-inbox";
import { requireAdminAccess } from "@/lib/auth/access";
import {
  contentPostSelect,
  inquirySelect,
  mapContentPost,
  mapInquiry,
} from "@/lib/content/db";
import { couponEventSelect, mapCouponEvent } from "@/lib/coupons/db";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminNotification } from "@/lib/types";

function eventTitle(eventType: string) {
  if (eventType === "coupon_used") {
    return "쿠폰 사용 처리";
  }

  if (eventType === "coupon_downloaded") {
    return "쿠폰 다운로드";
  }

  if (eventType === "issue_created") {
    return "쿠폰 발행";
  }

  if (eventType === "issue_stopped") {
    return "쿠폰 발행중단";
  }

  return "쿠폰 운영 변경";
}

export default async function AdminNotificationsPage() {
  const { canAccess } = await requireAdminAccess();

  if (!canAccess) {
    return (
      <AdminFrame
        active="notifications"
        title="알림함"
        description="관리자 권한과 이메일 인증이 필요합니다."
      >
        <AdminPanel className="p-6">
          <p className="text-sm font-semibold text-[var(--hm-primary)]">
            관리자 권한이 확인되면 알림함이 표시됩니다.
          </p>
        </AdminPanel>
      </AdminFrame>
    );
  }

  const admin = createAdminClient();
  const [{ data: eventRows }, { data: inquiryRows }, { data: noticeRows }] =
    await Promise.all([
      admin
        .from("coupon_events")
        .select(couponEventSelect)
        .order("created_at", { ascending: false })
        .limit(15),
      admin
        .from("inquiries")
        .select(inquirySelect)
        .order("created_at", { ascending: false })
        .limit(12),
      admin
        .from("content_posts")
        .select(contentPostSelect)
        .eq("type", "notice")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const couponNotifications: AdminNotification[] = (eventRows ?? [])
    .map(mapCouponEvent)
    .map((event) => ({
      id: `coupon-event-${event.id}`,
      title: eventTitle(event.eventType),
      description: `${event.actorName ?? event.actorEmail ?? "시스템"} · 쿠폰 운영 이력이 기록되었습니다.`,
      href:
        event.eventType === "coupon_used"
          ? "/admin/coupons/insights/used"
          : "/admin/coupons/insights/overview",
      tone: event.eventType === "coupon_used" ? "amber" : "green",
      category: "쿠폰",
      createdAt: event.createdAt,
    }));

  const inquiryNotifications: AdminNotification[] = (inquiryRows ?? [])
    .map(mapInquiry)
    .map((inquiry) => ({
      id: `inquiry-${inquiry.id}`,
      title: inquiry.status === "open" ? "문의 응답 대기" : "문의 처리 이력",
      description: `${inquiry.name} · ${inquiry.message.slice(0, 54)}`,
      href: "/admin/inquiries",
      tone: inquiry.status === "open" ? "red" : "green",
      category: "문의",
      createdAt: inquiry.createdAt,
    }));

  const noticeNotifications: AdminNotification[] = (noticeRows ?? [])
    .map(mapContentPost)
    .map((notice) => ({
      id: `notice-${notice.id}`,
      title: notice.status === "published" ? "공지 공개됨" : "공지 검토 필요",
      description: notice.title,
      href: "/admin/notices",
      tone: notice.status === "published" ? "green" : "amber",
      category: "공지",
      createdAt: notice.createdAt,
    }));

  const notifications = [
    ...inquiryNotifications,
    ...couponNotifications,
    ...noticeNotifications,
  ].sort((a, b) => {
    const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return right - left;
  });

  return (
    <AdminFrame
      active="notifications"
      title="알림함"
      description="운영 알림을 모아 보고 읽음, 보관, 삭제 상태를 관리합니다."
      notifications={notifications.slice(0, 8)}
    >
      <AdminNotificationInbox notifications={notifications} />
    </AdminFrame>
  );
}
