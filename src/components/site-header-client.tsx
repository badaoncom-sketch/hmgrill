"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Headset,
  Home,
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
import type { HeaderUser } from "@/components/header-user-controls";
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

const bottomNavItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/menu", label: "메뉴", icon: Utensils },
  { href: "/store", label: "매장", icon: MapPin },
  { href: "/coupons", label: "쿠폰", icon: Ticket },
  { href: "/mypage", label: "마이", icon: UserRound },
] as const;

export function HeaderMobileControls({ user }: { user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);

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
      <MobileMenu open={open} user={user} onClose={() => setOpen(false)} />
      <MobileBottomNav hidden={open} />
    </>
  );
}

function MobileMenu({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: HeaderUser | null;
  onClose: () => void;
}) {
  const isAuthenticated = Boolean(user);
  return (
    <div
      className={`fixed inset-0 z-[60] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
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
              src="/images/brand/brand-logo-transparent.png"
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
              src="/images/brand/brand-logo-transparent.png"
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
          <span className="relative z-10 mr-1 grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full bg-[#f6d339] text-[14px] font-black text-[#352300] shadow-[0_10px_24px_rgba(0,0,0,.28)] after:absolute after:bottom-1 after:left-2 after:h-3 after:w-3 after:rotate-45 after:bg-[#f6d339]">
            TALK
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

        <p className="mt-auto pt-10 text-center text-xs font-semibold text-white/34">
          Copyright HWAMOK. All rights reserved.
        </p>
      </aside>
    </div>
  );
}

function MobileBottomNav({ hidden }: { hidden: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="모바일 하단 메뉴"
      aria-hidden={hidden}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hm-border-soft)] bg-[rgba(13,13,13,.94)] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 text-[11px] font-bold text-white/56 backdrop-blur-md transition duration-200 md:hidden ${
        hidden ? "pointer-events-none translate-y-5 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-[520px] items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
