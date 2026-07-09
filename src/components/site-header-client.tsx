"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal, useFormStatus } from "react-dom";
import {
  Bell,
  ChevronRight,
  Headset,
  Home,
  LogIn,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Phone,
  ScanLine,
  Ticket,
  UserRound,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import type { HeaderUser } from "@/components/header-user-controls";
import { Spinner } from "@/components/ui/spinner";
import { drawerNavItems, policyLinks, siteContact } from "@/lib/navigation";

const drawerIcons: Record<string, LucideIcon> = {
  "/about": Home,
  "/menu": Utensils,
  "/coupons": Ticket,
  "/events": Bell,
  "/notices": Megaphone,
  "/store": MapPin,
  "/support": Headset,
};

const bottomNavBaseItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/menu", label: "메뉴", icon: Utensils },
  { href: "/store", label: "매장", icon: MapPin },
  { href: "/coupons", label: "쿠폰", icon: Ticket },
] as const;

const subscribeNoop = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function HeaderMobileControls({
  user,
  logoSrc,
}: {
  user: HeaderUser | null;
  logoSrc: string;
}) {
  const [open, setOpen] = useState(false);
  const mounted = useMounted();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false);
      }
    }

    mediaQuery.addEventListener("change", closeOnDesktop);
    return () => mediaQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <button
        type="button"
        className="hm-link-focus ml-1 grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.14] bg-white/[0.05] text-[var(--hm-text)] transition hover:border-[rgba(247,230,193,.35)] hover:text-[var(--hm-primary)] md:hidden"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
      </button>
      {/* 드로어는 body로 포털한다 — 헤더의 backdrop-filter가 containing block이
          되어 fixed 위치가 헤더 기준으로 틀어지는 것을 원천 차단. */}
      {mounted
        ? createPortal(
            <MobileMenu
              open={open}
              user={user}
              logoSrc={logoSrc}
              onClose={() => setOpen(false)}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function MobileMenu({
  open,
  user,
  logoSrc,
  onClose,
}: {
  open: boolean;
  user: HeaderUser | null;
  logoSrc: string;
  onClose: () => void;
}) {
  const isAuthenticated = Boolean(user);
  return (
    <div
      className={`fixed inset-0 z-[60] overflow-hidden md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
      <aside
        className={`absolute inset-y-0 right-0 isolate flex w-full max-w-[390px] flex-col overflow-y-auto border-l border-[var(--hm-border)] bg-[var(--hm-background)] p-6 text-[var(--hm-text)] shadow-[0_30px_90px_rgba(0,0,0,.55)] transition-transform duration-300 sm:max-w-[420px] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="전체 메뉴"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="hm-link-focus relative block h-[64px] w-[92px]" aria-label="화목 홈">
            <Image
              src={logoSrc}
              alt="화목"
              fill
              sizes="92px"
              className="object-contain object-left"
            />
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={siteContact.phoneHref}
              className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)]"
              aria-label="전화하기"
            >
              <Phone size={20} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)]"
              aria-label="메뉴 닫기"
            >
              <X size={26} aria-hidden="true" />
            </button>
          </div>
        </div>

        {user ? (
          <Link
            href="/mypage"
            onClick={onClose}
            className="hm-link-focus mt-7 flex items-center gap-4 rounded-[18px] border border-[rgba(247,230,193,.16)] bg-[linear-gradient(135deg,rgba(247,230,193,.08),rgba(184,130,30,.06))] p-4"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(247,230,193,.35)] bg-[rgba(247,230,193,.12)] text-[16px] font-bold text-[var(--hm-primary)]">
              {(user.name?.trim() || user.email).charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-white">
                {user.name?.trim() || "화목 회원"} 님
              </span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-white/42">
                {user.memberUid ? `UID ${user.memberUid}` : user.email}
              </span>
            </span>
            <ChevronRight size={16} className="ml-auto shrink-0 text-white/40" aria-hidden="true" />
          </Link>
        ) : null}

        <nav className="mt-7 grid gap-2">
          {drawerNavItems.map((item) => {
            const Icon = drawerIcons[item.href] ?? Home;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="hm-link-focus flex min-h-14 items-center gap-4 rounded-[16px] px-2 text-[16px] font-bold text-white/88 transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)]"
              >
                <Icon className="text-[var(--hm-accent-gold)]" size={20} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          {user && (user.role === "staff" || user.role === "admin") ? (
            <Link
              href="/qr-coupon"
              onClick={onClose}
              className="hm-link-focus flex min-h-14 items-center gap-4 rounded-[16px] px-2 text-[16px] font-bold text-white/88 transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)]"
            >
              <ScanLine className="text-[var(--hm-accent-gold)]" size={20} aria-hidden="true" />
              QR 쿠폰 스캔
            </Link>
          ) : null}
        </nav>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href={isAuthenticated ? "/mypage" : "/login"}
            onClick={onClose}
            className="hm-link-focus inline-flex min-h-12 items-center justify-center rounded-[14px] border border-[rgba(247,230,193,.38)] text-sm font-bold text-[var(--hm-primary)]"
          >
            {isAuthenticated ? "마이페이지" : "로그인"}
          </Link>
          <Link
            href={isAuthenticated ? "/coupons/my" : "/signup"}
            onClick={onClose}
            className="hm-link-focus inline-flex min-h-12 items-center justify-center rounded-[14px] border border-[rgba(247,230,193,.2)] bg-[rgba(247,230,193,.16)] text-sm font-bold text-[var(--hm-primary)]"
          >
            {isAuthenticated ? "내 쿠폰" : "회원가입"}
          </Link>
        </div>

        <Link
          href="/coupons"
          onClick={onClose}
          className="hm-link-focus relative mt-6 flex min-h-[86px] items-center justify-between gap-5 overflow-hidden rounded-[18px] border border-[rgba(247,230,193,.12)] bg-[linear-gradient(135deg,rgba(247,230,193,.15),rgba(184,130,30,.14)_58%,rgba(247,230,193,.08))] px-5 py-4 shadow-[0_18px_42px_rgba(0,0,0,.22)]"
        >
          <span className="pointer-events-none absolute right-10 top-1/2 h-24 w-24 -translate-y-1/2 opacity-[0.07]">
            <Image
              src={logoSrc}
              alt=""
              fill
              sizes="96px"
              className="object-contain"
            />
          </span>
          <span className="relative z-10 text-[18px] font-black leading-[1.65] text-[var(--hm-primary)] drop-shadow-[0_2px_8px_rgba(0,0,0,.35)]">
            카카오 채널 추가하고
            <br />
            QR 쿠폰 받기!
          </span>
          <span className="relative z-10 mr-1 grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[16px] bg-[#FEE500] shadow-[0_10px_24px_rgba(0,0,0,.28)]">
            {/* 카카오톡 말풍선 로고 */}
            <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
              <path
                fill="#191919"
                d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.26 4.66 6.66-.2.74-.73 2.68-.84 3.1-.13.52.19.51.4.37.17-.11 2.65-1.8 3.72-2.53.66.1 1.35.15 2.06.15 5.52 0 10-3.54 10-7.9S17.52 3 12 3z"
              />
            </svg>
          </span>
        </Link>

        <div className="mt-8 grid gap-1 border-y border-[var(--hm-divider)] py-4">
          {policyLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="hm-link-focus flex min-h-11 items-center justify-between rounded-[12px] text-sm font-semibold text-white/58 transition hover:text-[var(--hm-primary)]"
            >
              {item.label}
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <p className="hm-eyebrow">Customer Center</p>
          <p className="mt-3 text-[28px] font-bold leading-none text-white">{siteContact.phoneDisplay}</p>
          <p className="hm-caption mt-3 text-white/48">
            {siteContact.hoursWeekday}
            <br />
            {siteContact.hoursWeekend}
          </p>
        </div>

        {user ? (
          // 로그아웃하면 서버 액션이 메인(/)으로 보낸다.
          <form action={logoutAction} onSubmit={onClose} className="mt-8">
            <DrawerLogoutButton />
          </form>
        ) : null}

        <p className="mt-auto pt-10 text-center text-xs font-semibold text-white/34">
          Copyright HWAMOK. All rights reserved.
        </p>
      </aside>
    </div>
  );
}

function DrawerLogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="hm-link-focus flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-white/[0.12] text-sm font-bold text-white/55 transition hover:border-[rgba(198,59,45,.4)] hover:text-[#f0a39b] disabled:opacity-60"
    >
      {pending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <LogOut size={16} aria-hidden="true" />
      )}
      로그아웃
    </button>
  );
}

// 주의: 이 컴포넌트는 반드시 header 바깥(레이아웃 레벨)에서 렌더링해야 한다.
// header의 backdrop-blur가 containing block이 되어 fixed bottom-0이
// 뷰포트가 아닌 헤더 기준으로 붙어버리기 때문이다.
export function MobileBottomNav({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  // 로그인 상태에 따라 마지막 탭을 분별한다: 비로그인은 로그인 유도, 로그인은 마이페이지.
  const bottomNavItems = [
    ...bottomNavBaseItems,
    user
      ? ({ href: "/mypage", label: "마이", icon: UserRound } as const)
      : ({ href: "/login", label: "로그인", icon: LogIn } as const),
  ];

  return (
    <nav
      aria-label="모바일 하단 메뉴"
      className="hm-autohide-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hm-border-soft)] bg-[rgba(13,13,13,.94)] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 text-[11px] font-bold text-white/56 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-[520px] items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                // 앱 관례: 현재 화면의 탭을 다시 누르면 맨 위로 스크롤한다.
                if (pathname === item.href) {
                  event.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`hm-link-focus flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-[16px] transition ${
                active ? "text-[var(--hm-primary)]" : "hover:text-[var(--hm-primary)]"
              }`}
            >
              <Icon size={21} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
