import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  NotificationBell,
  UserMenu,
  type HeaderUser,
} from "@/components/header-user-controls";
import { HeaderMobileControls } from "@/components/site-header-client";
import { headerNavItems, siteContact } from "@/lib/navigation";
import type { MemberNotification } from "@/lib/notifications/db";

export function SiteHeader({
  user,
  notifications,
  unreadCount,
  logoSrc,
}: {
  user: HeaderUser | null;
  notifications: MemberNotification[];
  unreadCount: number;
  logoSrc: string;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--hm-border-soft)] bg-[rgba(13,13,13,.4)] text-[var(--hm-text)] backdrop-blur-md md:h-20 md:bg-[rgba(13,13,13,.28)]">
      <div className="hm-container grid h-full grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4">
        <Link href="/" className="hm-link-focus flex items-center gap-3" aria-label="화목 홈">
          <span className="relative block h-[46px] w-[68px] md:h-[66px] md:w-[96px]">
            <Image
              src={logoSrc}
              alt="화목"
              fill
              sizes="96px"
              className="object-contain drop-shadow-[0_10px_26px_rgba(0,0,0,0.55)]"
            />
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-7 text-[13px] font-semibold text-white/82 md:flex xl:gap-11">
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

        <div className="flex items-center justify-end gap-0.5 text-sm font-semibold md:gap-1.5">
          <a
            href={siteContact.phoneHref}
            className="hm-link-focus hidden h-10 w-10 place-items-center rounded-[14px] text-[var(--hm-primary)] transition hover:bg-white/[0.04] md:grid"
            aria-label="전화하기"
          >
            <Phone size={19} aria-hidden="true" />
          </a>
          {user ? <NotificationBell notifications={notifications} unreadCount={unreadCount} /> : null}
          {user ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
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
            </div>
          )}
          <HeaderMobileControls user={user} logoSrc={logoSrc} />
        </div>
      </div>
    </header>
  );
}
