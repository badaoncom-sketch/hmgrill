"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  Bell,
  History,
  LayoutDashboard,
  LogOut,
  ScanLine,
  Ticket,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import {
  markAllNotificationsReadAction,
  openNotificationAction,
} from "@/app/actions/notifications";
import { notificationMeta } from "@/components/notification-meta";
import type { MemberNotification } from "@/lib/notifications/db";
import { formatDate } from "@/lib/utils";

export type HeaderUser = {
  name: string | null;
  email: string;
  memberUid: string | null;
  role: string;
};

function DropdownSubmitButton({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  // 서버 액션 처리 중에는 버튼을 잠그고 흐리게 표시한다.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? "pointer-events-none opacity-55" : ""}`}
    >
      {children}
    </button>
  );
}

function HeaderDropdown({
  label,
  trigger,
  triggerHref,
  children,
  panelClassName = "",
}: {
  label: string;
  trigger: ReactNode;
  // 지정하면 트리거가 링크가 된다: 호버는 미리보기 패널, 클릭은 해당 페이지로 이동.
  triggerHref?: string;
  children: ReactNode;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openOnHover = () => {
    // 터치 기기에서는 탭이 mouseenter를 함께 발생시키므로, 호버 지원 기기에서만 미리보기를 연다.
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openOnHover}
      onMouseLeave={closeSoon}
    >
      {triggerHref ? (
        <Link
          href={triggerHref}
          aria-label={label}
          className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)] transition hover:bg-white/[0.05]"
        >
          {trigger}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)] transition hover:bg-white/[0.05]"
        >
          {trigger}
        </button>
      )}
      {open ? (
        <div
          className={`absolute right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[20px] border border-[rgba(247,230,193,.14)] bg-[#161310] shadow-[0_28px_80px_rgba(0,0,0,.55)] ${panelClassName}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: MemberNotification[];
  unreadCount: number;
}) {
  return (
    <HeaderDropdown
      label="알림"
      triggerHref="/notifications"
      panelClassName="w-[330px] max-w-[calc(100vw-32px)]"
      trigger={
        <span className="relative">
          <Bell size={20} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--hm-accent-red)] px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </span>
      }
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
        <p className="text-sm font-bold text-white">
          알림
          {unreadCount > 0 ? (
            <span className="ml-1.5 text-[var(--hm-accent-gold)]">{unreadCount}</span>
          ) : null}
        </p>
        <div className="flex items-center gap-3">
          {unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <DropdownSubmitButton className="hm-link-focus text-xs font-bold text-white/45 transition hover:text-[var(--hm-primary)]">
                모두 읽음
              </DropdownSubmitButton>
            </form>
          ) : null}
          <Link
            href="/notifications"
            className="hm-link-focus text-xs font-bold text-[var(--hm-accent-gold)] transition hover:text-[var(--hm-primary)]"
          >
            전체 보기
          </Link>
        </div>
      </div>
      <div className="max-h-[380px] overflow-y-auto border-t border-white/[0.06] p-2">
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const meta = notificationMeta[item.type];
            const Icon = meta.icon;
            const unread = !item.readAt;
            return (
              <form key={item.id} action={openNotificationAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="href" value={item.href ?? "/notifications"} />
                <DropdownSubmitButton className="hm-link-focus flex w-full items-start gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-white/[0.05]">
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border ${
                      unread
                        ? "border-[rgba(247,230,193,.3)] text-[var(--hm-primary)]"
                        : "border-[var(--hm-border)] text-white/35"
                    }`}
                  >
                    <Icon size={15} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] font-semibold ${
                        unread ? "text-white" : "text-white/50"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold text-white/38">
                      {meta.label} · {formatDate(item.createdAt)}
                    </span>
                  </span>
                  {unread ? (
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--hm-accent-gold)]"
                      aria-label="읽지 않음"
                    />
                  ) : null}
                </DropdownSubmitButton>
              </form>
            );
          })
        ) : (
          <p className="px-3 py-6 text-center text-[13px] font-semibold text-white/40">
            새로운 알림이 없습니다.
          </p>
        )}
      </div>
    </HeaderDropdown>
  );
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const displayName = user.name?.trim() || "화목 회원";
  const initial = (user.name?.trim() || user.email).charAt(0).toUpperCase();

  const menuItems = [
    { href: "/mypage", label: "마이페이지", icon: UserRound },
    { href: "/coupons/my", label: "내 쿠폰", icon: Ticket },
    { href: "/coupons/history", label: "사용내역", icon: History },
    ...(user.role === "admin"
      ? [{ href: "/admin", label: "관리자 콘솔", icon: LayoutDashboard }]
      : []),
    ...(user.role === "staff" || user.role === "admin"
      ? [{ href: "/qr-coupon", label: "QR 쿠폰 스캔", icon: ScanLine }]
      : []),
  ];

  return (
    <HeaderDropdown
      label="내 계정"
      panelClassName="w-[280px]"
      trigger={
        <span className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(247,230,193,.35)] bg-[linear-gradient(135deg,rgba(247,230,193,.2),rgba(184,130,30,.16))] text-[14px] font-bold text-[var(--hm-primary)]">
          {initial}
        </span>
      }
    >
      <div className="px-5 pb-4 pt-5">
        <p className="text-[15px] font-bold text-white">{displayName} 님</p>
        <p className="mt-1 truncate text-xs font-medium text-white/45">{user.email}</p>
        {user.memberUid ? (
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/32">
            UID{" "}
            <span className="ml-1 font-mono text-[12px] tracking-[0.14em] text-[var(--hm-primary)]">
              {user.memberUid}
            </span>
          </p>
        ) : null}
      </div>
      <div className="border-t border-white/[0.06] p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="hm-link-focus flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)]"
            >
              <Icon size={16} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-white/[0.06] p-2">
        <form action={logoutAction}>
          <DropdownSubmitButton className="hm-link-focus flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.05] hover:text-[var(--hm-accent-red)]">
            <LogOut size={16} aria-hidden="true" />
            로그아웃
          </DropdownSubmitButton>
        </form>
      </div>
    </HeaderDropdown>
  );
}
