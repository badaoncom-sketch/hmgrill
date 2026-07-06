"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Home,
  MapPin,
  Menu,
  Phone,
  Ticket,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const headerNavItems = [
  { href: "/about", label: "화목 소개" },
  { href: "/menu", label: "메뉴" },
  { href: "/coupons", label: "쿠폰" },
  { href: "/events", label: "이벤트" },
  { href: "/store", label: "매장 안내" },
  { href: "/support", label: "고객센터" },
];

const drawerItems = [
  { href: "/about", label: "화목 소개", icon: Home },
  { href: "/menu", label: "메뉴", icon: Utensils },
  { href: "/coupons", label: "쿠폰", icon: Ticket },
  { href: "/events", label: "이벤트", icon: Bell },
  { href: "/notices", label: "공지사항", icon: Bell },
  { href: "/store", label: "매장 안내", icon: MapPin },
  { href: "/support", label: "고객센터", icon: UserRound },
];

const policyItems = [
  { href: "/about", label: "회사 소개" },
  { href: "/support", label: "이용 안내" },
  { href: "/support", label: "개인정보처리방침" },
  { href: "/support", label: "이용약관" },
];

const bottomNavItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/menu", label: "메뉴", icon: Utensils },
  { href: "/store", label: "매장", icon: MapPin },
  { href: "/coupons", label: "쿠폰", icon: Ticket },
  { href: "/mypage", label: "마이", icon: UserRound },
];

export function SiteHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
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

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--hm-border-soft)] bg-[rgba(13,13,13,.28)] text-[var(--hm-text)] backdrop-blur-md">
        <div className="hm-container grid h-full grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="hm-link-focus flex items-center gap-3" aria-label="화목 홈">
            <span className="relative block h-[62px] w-[92px] md:h-[66px] md:w-[96px]">
              <Image
                src="/images/brand/brand-logo-transparent.png"
                alt="화목"
                fill
                sizes="96px"
                className="object-contain drop-shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
              />
            </span>
          </Link>

          <nav className="hidden min-w-0 items-center justify-center gap-8 text-[13px] font-semibold text-white/82 md:flex xl:gap-11">
            {headerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hm-link-focus shrink-0 rounded-[14px] px-1 py-2 transition hover:text-[var(--hm-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 text-sm font-semibold">
            <a
              href="tel:0212345678"
              className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)] transition hover:bg-white/[0.04]"
              aria-label="전화하기"
            >
              <Phone size={20} aria-hidden="true" />
            </a>
            <div className="hidden items-center gap-2 xl:flex">
              {isAuthenticated ? (
                <Link
                  href="/mypage"
                  className="hm-link-focus rounded-[14px] border border-[rgba(247,230,193,.28)] px-4 py-2 text-[var(--hm-primary)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-[var(--hm-background)]"
                >
                  마이페이지
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hm-link-focus rounded-[14px] px-3 py-2 text-white/82 transition hover:text-[var(--hm-primary)]"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="hm-link-focus rounded-[14px] border border-[rgba(247,230,193,.28)] px-4 py-2 text-[var(--hm-primary)] transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-[var(--hm-background)]"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
            <button
              type="button"
              className="hm-link-focus grid h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)] transition hover:bg-white/[0.04] xl:hidden"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={26} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={open} isAuthenticated={isAuthenticated} onClose={() => setOpen(false)} />
      <MobileBottomNav hidden={open} />
    </>
  );
}

function MobileMenu({
  open,
  isAuthenticated,
  onClose,
}: {
  open: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-[60] xl:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
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
              href="tel:0212345678"
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

        <nav className="mt-9 grid gap-2">
          {drawerItems.map((item) => {
            const Icon = item.icon;
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
          {policyItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
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
          <p className="mt-3 text-[28px] font-bold leading-none text-white">02-1234-5678</p>
          <p className="hm-caption mt-3 text-white/48">
            평일 10:00 - 22:00
            <br />
            주말/공휴일 11:00 - 22:00
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hm-border-soft)] bg-[rgba(13,13,13,.94)] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 text-[11px] font-bold text-white/56 backdrop-blur-md transition duration-200 xl:hidden ${
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
