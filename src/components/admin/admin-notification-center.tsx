"use client";

import Link from "next/link";
import { Archive, Bell, CheckCheck, Inbox, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AdminNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

type NotificationStore = {
  readIds: string[];
  archivedIds: string[];
  deletedIds: string[];
};

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

export function AdminNotificationCenter({
  notifications,
}: {
  notifications: AdminNotification[];
}) {
  const [open, setOpen] = useState(false);
  const [store, setStore] = useState<NotificationStore>(emptyStore);

  useEffect(() => {
    const timer = window.setTimeout(() => setStore(readStore()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateStore(next: NotificationStore) {
    setStore(next);
    writeStore(next);
  }

  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        (item) =>
          !store.deletedIds.includes(item.id) &&
          !store.archivedIds.includes(item.id),
      ),
    [notifications, store.archivedIds, store.deletedIds],
  );
  const unreadCount = visibleNotifications.filter(
    (item) => !store.readIds.includes(item.id),
  ).length;

  function markRead(id: string) {
    updateStore({ ...store, readIds: unique([...store.readIds, id]) });
  }

  function markAllRead() {
    updateStore({
      ...store,
      readIds: unique([
        ...store.readIds,
        ...visibleNotifications.map((item) => item.id),
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

  function remove(id: string) {
    updateStore({
      ...store,
      deletedIds: unique([...store.deletedIds, id]),
    });
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <button
        type="button"
        aria-label="관리자 알림"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="hm-link-focus relative grid h-11 w-11 place-items-center rounded-[14px] border border-[rgba(255,255,255,.09)] bg-white/[0.035] text-[var(--hm-primary)] transition hover:border-[rgba(247,230,193,.28)] hover:bg-white/[0.06]"
      >
        <Bell size={19} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--hm-accent-red)]" />
        ) : null}
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-50 w-[min(390px,calc(100vw-32px))] pt-3 transition",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="rounded-[22px] border border-[rgba(255,255,255,.1)] bg-[linear-gradient(145deg,rgba(24,24,24,.98),rgba(10,10,10,.98))] p-2 shadow-[0_28px_80px_rgba(0,0,0,.5)]">
          <div className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,.06)] px-3 py-3">
            <div>
              <p className="text-sm font-extrabold text-white">알림</p>
              <p className="mt-1 text-xs font-semibold text-white/42">
                안읽음 {unreadCount}건 · 전체 {visibleNotifications.length}건
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={markAllRead}
                className="hm-link-focus grid h-9 w-9 place-items-center rounded-[12px] text-white/54 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)]"
                aria-label="전체 읽음 표시"
              >
                <CheckCheck size={17} aria-hidden="true" />
              </button>
              <Link
                href="/admin/notifications"
                className="hm-link-focus grid h-9 w-9 place-items-center rounded-[12px] text-white/54 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)]"
                aria-label="알림함으로 이동"
              >
                <Inbox size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid max-h-[390px] overflow-y-auto py-2">
            {visibleNotifications.slice(0, 6).map((item) => {
              const unread = !store.readIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-[14px] px-3 py-3 transition hover:bg-white/[0.045]"
                >
                  <Link
                    href={item.href}
                    onClick={() => markRead(item.id)}
                    className="hm-link-focus grid gap-1 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-extrabold text-white">
                      <i
                        className={cn(
                          "h-2 w-2 rounded-full",
                          unread ? "opacity-100" : "opacity-35",
                          item.tone === "red"
                            ? "bg-[var(--hm-accent-red)]"
                            : item.tone === "green"
                              ? "bg-emerald-400"
                              : "bg-[var(--hm-accent-gold)]",
                        )}
                      />
                      {item.title}
                    </span>
                    <span className="text-xs font-semibold leading-5 text-white/48">
                      {item.description}
                    </span>
                  </Link>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className="hm-link-focus rounded-[10px] px-2 py-1 text-[11px] font-bold text-white/45 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)]"
                    >
                      읽음
                    </button>
                    <button
                      type="button"
                      onClick={() => archive(item.id)}
                      className="hm-link-focus grid h-7 w-7 place-items-center rounded-[10px] text-white/45 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)]"
                      aria-label="알림 보관"
                    >
                      <Archive size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="hm-link-focus grid h-7 w-7 place-items-center rounded-[10px] text-white/45 transition hover:bg-white/[0.05] hover:text-[var(--hm-accent-red)]"
                      aria-label="알림 삭제"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
            {visibleNotifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm font-semibold text-white/42">
                확인할 알림이 없습니다.
              </p>
            ) : null}
          </div>

          <Link
            href="/admin/notifications"
            className="hm-link-focus mt-1 flex min-h-11 items-center justify-center rounded-[14px] border border-[rgba(247,230,193,.18)] text-sm font-extrabold text-[var(--hm-primary)] transition hover:bg-[var(--hm-primary)] hover:text-[#0d0d0d]"
          >
            알림함 전체 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
