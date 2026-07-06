"use client";

import Link from "next/link";
import {
  Archive,
  Check,
  CheckCheck,
  EyeOff,
  Inbox,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

type NotificationStore = {
  readIds: string[];
  archivedIds: string[];
  deletedIds: string[];
};

type Filter = "all" | "unread" | "archived";

const storageKey = "hmgrill-admin-notifications-v1";

const emptyStore: NotificationStore = {
  readIds: [],
  archivedIds: [],
  deletedIds: [],
};

function readStore() {
  if (typeof window === "undefined") {
    return emptyStore;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "");
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      archivedIds: Array.isArray(parsed.archivedIds) ? parsed.archivedIds : [],
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
    } satisfies NotificationStore;
  } catch {
    return emptyStore;
  }
}

function writeStore(store: NotificationStore) {
  window.localStorage.setItem(storageKey, JSON.stringify(store));
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function formatDate(value?: string) {
  if (!value) {
    return "방금 전";
  }

  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminNotificationInbox({
  notifications,
}: {
  notifications: AdminNotification[];
}) {
  const [store, setStore] = useState<NotificationStore>(emptyStore);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setStore(readStore()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateStore(next: NotificationStore) {
    setStore(next);
    writeStore(next);
  }

  const activeNotifications = useMemo(
    () => notifications.filter((item) => !store.deletedIds.includes(item.id)),
    [notifications, store.deletedIds],
  );
  const unreadCount = activeNotifications.filter(
    (item) =>
      !store.readIds.includes(item.id) && !store.archivedIds.includes(item.id),
  ).length;
  const archivedCount = activeNotifications.filter((item) =>
    store.archivedIds.includes(item.id),
  ).length;
  const displayed = activeNotifications.filter((item) => {
    const archived = store.archivedIds.includes(item.id);
    const unread = !store.readIds.includes(item.id);

    if (filter === "archived") {
      return archived;
    }

    if (filter === "unread") {
      return unread && !archived;
    }

    return !archived;
  });

  function markRead(id: string) {
    updateStore({ ...store, readIds: unique([...store.readIds, id]) });
  }

  function markUnread(id: string) {
    updateStore({
      ...store,
      readIds: store.readIds.filter((item) => item !== id),
    });
  }

  function markAllRead() {
    updateStore({
      ...store,
      readIds: unique([
        ...store.readIds,
        ...activeNotifications
          .filter((item) => !store.archivedIds.includes(item.id))
          .map((item) => item.id),
      ]),
    });
  }

  function archive(id: string) {
    updateStore({
      ...store,
      readIds: unique([...store.readIds, id]),
      archivedIds: unique([...store.archivedIds, id]),
    });
  }

  function restore(id: string) {
    updateStore({
      ...store,
      archivedIds: store.archivedIds.filter((item) => item !== id),
    });
  }

  function remove(id: string) {
    updateStore({
      ...store,
      deletedIds: unique([...store.deletedIds, id]),
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="전체 알림" value={`${activeNotifications.length}건`} />
        <SummaryCard label="안읽음" value={`${unreadCount}건`} tone="amber" />
        <SummaryCard label="보관" value={`${archivedCount}건`} />
      </div>

      <div className="rounded-[22px] border border-[rgba(255,255,255,.09)] bg-[linear-gradient(145deg,rgba(35,35,35,.82),rgba(18,18,18,.92))] shadow-[0_24px_70px_rgba(0,0,0,.28)]">
        <div className="flex flex-col gap-3 border-b border-[rgba(255,255,255,.06)] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "전체"] as const,
              ["unread", "안읽음"] as const,
              ["archived", "보관"] as const,
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "hm-link-focus min-h-10 rounded-[14px] border px-4 text-sm font-extrabold transition",
                  filter === value
                    ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-[#0d0d0d]"
                    : "border-[rgba(255,255,255,.09)] text-white/58 hover:border-[rgba(247,230,193,.28)] hover:text-[var(--hm-primary)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={markAllRead}>
            <CheckCheck size={16} aria-hidden="true" />
            전체 읽음 표시
          </Button>
        </div>

        <div className="grid divide-y divide-[rgba(255,255,255,.06)] px-5">
          {displayed.map((item) => {
            const unread = !store.readIds.includes(item.id);
            const archived = store.archivedIds.includes(item.id);

            return (
              <article key={item.id} className="grid gap-4 py-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <Link
                  href={item.href}
                  onClick={() => markRead(item.id)}
                  className="hm-link-focus grid gap-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        unread ? "opacity-100" : "opacity-30",
                        item.tone === "red"
                          ? "bg-[var(--hm-accent-red)]"
                          : item.tone === "green"
                            ? "bg-emerald-400"
                            : "bg-[var(--hm-accent-gold)]",
                      )}
                    />
                    <h2 className="text-base font-extrabold text-white">{item.title}</h2>
                    <Badge tone={unread ? "amber" : "neutral"}>
                      {unread ? "안읽음" : "읽음"}
                    </Badge>
                    {archived ? <Badge>보관</Badge> : null}
                    {item.category ? <Badge tone="neutral">{item.category}</Badge> : null}
                  </div>
                  <p className="text-sm font-semibold leading-6 text-white/52">
                    {item.description}
                  </p>
                  <p className="text-xs font-semibold text-white/34">
                    {formatDate(item.createdAt)}
                  </p>
                </Link>

                <div className="flex flex-wrap gap-2">
                  {unread ? (
                    <IconButton label="읽음" onClick={() => markRead(item.id)}>
                      <Check size={15} aria-hidden="true" />
                    </IconButton>
                  ) : (
                    <IconButton label="안읽음" onClick={() => markUnread(item.id)}>
                      <EyeOff size={15} aria-hidden="true" />
                    </IconButton>
                  )}
                  {archived ? (
                    <IconButton label="보관 해제" onClick={() => restore(item.id)}>
                      <RotateCcw size={15} aria-hidden="true" />
                    </IconButton>
                  ) : (
                    <IconButton label="보관" onClick={() => archive(item.id)}>
                      <Archive size={15} aria-hidden="true" />
                    </IconButton>
                  )}
                  <IconButton label="삭제" danger onClick={() => remove(item.id)}>
                    <Trash2 size={15} aria-hidden="true" />
                  </IconButton>
                </div>
              </article>
            );
          })}
          {displayed.length === 0 ? (
            <div className="grid place-items-center gap-3 py-16 text-center">
              <Inbox className="text-[var(--hm-primary)]" size={34} aria-hidden="true" />
              <p className="text-sm font-semibold text-white/42">
                표시할 알림이 없습니다.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string;
  tone?: "primary" | "amber";
}) {
  return (
    <div className="rounded-[20px] border border-[rgba(255,255,255,.09)] bg-black/20 p-5">
      <p className="text-sm font-bold text-white/52">{label}</p>
      <p
        className={cn(
          "mt-3 text-[30px] font-extrabold",
          tone === "amber" ? "text-[var(--hm-accent-gold)]" : "text-[var(--hm-primary)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function IconButton({
  children,
  label,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "hm-link-focus inline-flex min-h-9 items-center gap-1.5 rounded-[12px] border border-[rgba(255,255,255,.09)] px-3 text-xs font-extrabold text-white/58 transition hover:bg-white/[0.05]",
        danger ? "hover:text-[var(--hm-accent-red)]" : "hover:text-[var(--hm-primary)]",
      )}
    >
      {children}
      {label}
    </button>
  );
}
