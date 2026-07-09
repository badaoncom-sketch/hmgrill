import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import {
  deleteNotificationAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  openNotificationAction,
  toggleNotificationArchiveAction,
} from "@/app/actions/notifications";
import { notificationMeta } from "@/components/notification-meta";
import { InlineSubmitButton } from "@/components/inline-submit-button";
import { MenuSubmitButton, RowActionsMenu } from "@/components/row-actions-menu";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import {
  mapMemberNotification,
  memberNotificationSelect,
} from "@/lib/notifications/db";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "알림센터",
  description: "쿠폰 발급·사용, 만료 임박, 새 소식을 한곳에서 관리합니다.",
};

const emptyMessages = {
  all: "아직 알림이 없습니다. 쿠폰을 받거나 새 소식이 올라오면 이곳에 표시됩니다.",
  unread: "안 읽은 알림이 없습니다. 모두 확인하셨어요.",
  archive: "보관한 알림이 없습니다. 보관 버튼으로 중요한 알림을 따로 모아둘 수 있어요.",
} as const;

type NotificationTab = keyof typeof emptyMessages;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab: NotificationTab =
    tab === "unread" || tab === "archive" ? tab : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.email_verified) {
    redirect("/login");
  }

  await supabase.rpc("sync_member_notifications");

  const countBase = () =>
    supabase
      .from("member_notifications")
      .select("id", { count: "exact", head: true })
      .eq("member_id", user.id)
      .is("deleted_at", null);

  let listQuery = supabase
    .from("member_notifications")
    .select(memberNotificationSelect)
    .eq("member_id", user.id)
    .is("deleted_at", null);
  if (activeTab === "archive") {
    listQuery = listQuery.not("archived_at", "is", null);
  } else {
    listQuery = listQuery.is("archived_at", null);
    if (activeTab === "unread") {
      listQuery = listQuery.is("read_at", null);
    }
  }

  const [{ data: rows }, { count: allCount }, { count: unreadCount }, { count: archivedCount }] =
    await Promise.all([
      listQuery.order("created_at", { ascending: false }).limit(50),
      countBase().is("archived_at", null),
      countBase().is("archived_at", null).is("read_at", null),
      countBase().not("archived_at", "is", null),
    ]);
  const notifications = (rows ?? []).map(mapMemberNotification);

  const tabs: { key: NotificationTab; label: string; count: number }[] = [
    { key: "all", label: "전체", count: allCount ?? 0 },
    { key: "unread", label: "안읽음", count: unreadCount ?? 0 },
    { key: "archive", label: "보관함", count: archivedCount ?? 0 },
  ];

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">Notification</p>
            <h1 className="hm-section-title mt-3 md:mt-5">알림센터</h1>
            <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">
              쿠폰 발급·사용 처리, 만료 임박 안내, 새 공지와 이벤트 소식을 한곳에서 관리합니다.
            </p>
          </div>
          {(unreadCount ?? 0) > 0 ? (
            <form action={markAllNotificationsReadAction} className="shrink-0">
              <Button type="submit" variant="outline">
                <CheckCheck size={16} aria-hidden="true" />
                모두 읽음 처리 ({unreadCount})
              </Button>
            </form>
          ) : null}
        </div>

        <div className="hm-no-scrollbar mt-7 flex gap-2 overflow-x-auto md:mt-10">
          {tabs.map((item) => {
            const active = item.key === activeTab;
            return (
              <Link
                key={item.key}
                href={item.key === "all" ? "/notifications" : `/notifications?tab=${item.key}`}
                className={`hm-link-focus flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-[var(--hm-background)]"
                    : "border-[var(--hm-border)] bg-[var(--hm-card)] text-[var(--hm-subtext)] hover:border-[rgba(247,230,193,.32)] hover:text-[var(--hm-primary)]"
                }`}
              >
                {item.label}
                <span
                  className={`font-mono text-[11px] ${
                    active ? "text-[var(--hm-background)]/70" : "text-[var(--hm-accent-gold)]"
                  }`}
                >
                  {item.count}
                </span>
              </Link>
            );
          })}
        </div>

        {notifications.length > 0 ? (
          <div className="mt-6 rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
            <div className="divide-y divide-[var(--hm-divider)]">
              {notifications.map((item) => {
                const meta = notificationMeta[item.type];
                const Icon = meta.icon;
                const unread = !item.readAt;
                const archived = Boolean(item.archivedAt);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2 p-4 lg:pl-6 lg:pr-4 ${
                      unread ? "bg-[rgba(247,230,193,.03)]" : ""
                    }`}
                  >
                    <form action={openNotificationAction} className="min-w-0 flex-1">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="href" value={item.href ?? "/notifications"} />
                      <InlineSubmitButton
                        dim
                        className="hm-link-focus flex w-full items-start gap-4 rounded-[14px] p-1.5 text-left transition hover:bg-white/[0.03]"
                      >
                        <span
                          className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border ${
                            unread
                              ? "border-[rgba(247,230,193,.3)] text-[var(--hm-primary)]"
                              : "border-[var(--hm-border)] text-white/35"
                          }`}
                        >
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[15px] font-bold leading-snug ${
                              unread ? "text-white" : "text-white/55"
                            }`}
                          >
                            {item.title}
                          </span>
                          {item.body ? (
                            <span className="hm-caption mt-1 block text-[var(--hm-subtext)]">
                              {item.body}
                            </span>
                          ) : null}
                          <span className="mt-2 block text-xs font-semibold text-white/38">
                            {meta.label} · {formatDate(item.createdAt)}
                            {archived ? " · 보관됨" : ""}
                          </span>
                        </span>
                        {unread ? (
                          <span
                            className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--hm-accent-gold)]"
                            aria-label="읽지 않음"
                          />
                        ) : null}
                      </InlineSubmitButton>
                    </form>

                    <div className="shrink-0 pt-1">
                      <RowActionsMenu>
                        {unread ? (
                          <form action={markNotificationReadAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <MenuSubmitButton>
                              <Check size={15} aria-hidden="true" />
                              읽음 처리
                            </MenuSubmitButton>
                          </form>
                        ) : null}
                        <form action={toggleNotificationArchiveAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="archived" value={archived ? "0" : "1"} />
                          <MenuSubmitButton>
                            {archived ? (
                              <ArchiveRestore size={15} aria-hidden="true" />
                            ) : (
                              <Archive size={15} aria-hidden="true" />
                            )}
                            {archived ? "보관 해제" : "보관"}
                          </MenuSubmitButton>
                        </form>
                        <form action={deleteNotificationAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <MenuSubmitButton danger>
                            <Trash2 size={15} aria-hidden="true" />
                            삭제
                          </MenuSubmitButton>
                        </form>
                      </RowActionsMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <BellOff className="mx-auto text-white/30" size={32} aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-[var(--hm-subtext)]">
              {emptyMessages[activeTab]}
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
