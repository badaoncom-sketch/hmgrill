import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowLeft, ChevronDown, LogOut, Store } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import {
  adminNavItems,
  type AdminNavKey,
} from "@/components/admin/admin-nav-items";
import { AdminNotificationCenter } from "@/components/admin/admin-notification-center";
import type { AdminNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultNotifications: AdminNotification[] = [
  {
    id: "default-dashboard",
    title: "운영 현황 확인",
    description: "대시보드에서 쿠폰, 문의, 콘텐츠 상태를 점검합니다.",
    href: "/admin",
    tone: "amber",
  },
  {
    id: "default-notices",
    title: "공지사항 관리",
    description: "고객에게 노출되는 안내를 최신 상태로 유지합니다.",
    href: "/admin/notices",
  },
  {
    id: "default-inquiries",
    title: "문의 응답 대기",
    description: "접수된 문의가 있으면 고객센터 메뉴에서 처리합니다.",
    href: "/admin/inquiries",
    tone: "red",
  },
];

export function AdminFrame({
  active,
  title,
  description,
  backHref,
  backLabel,
  notifications = defaultNotifications,
  children,
}: {
  active: AdminNavKey;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  notifications?: AdminNotification[];
  children: ReactNode;
}) {
  const today = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());

  return (
    <main
      data-admin-root
      className="min-h-screen bg-[radial-gradient(circle_at_70%_0%,rgba(184,130,30,.08),transparent_34%),linear-gradient(135deg,#0d0d0d,#080808)] px-3 py-4 text-white md:px-6 md:py-6"
    >
      <div className="mx-auto grid max-w-[1600px] gap-5 xl:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100svh-128px)] rounded-[28px] border border-[rgba(255,255,255,.09)] bg-[linear-gradient(180deg,rgba(26,26,26,.92),rgba(10,10,10,.96))] p-5 shadow-[0_30px_90px_rgba(0,0,0,.36)] xl:flex xl:flex-col">
          <Link href="/admin" className="hm-link-focus relative block h-[78px] w-[126px]" aria-label="관리자 홈">
            <Image
              src="/images/brand/brand-logo-transparent.png"
              alt="화목"
              fill
              sizes="126px"
              className="object-contain object-left"
            />
          </Link>

          <div className="mt-6 flex items-center gap-3 rounded-[20px] border border-[rgba(255,255,255,.07)] bg-white/[0.025] p-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#f7e6c1,#8b6421)] text-[17px] font-extrabold text-[#0d0d0d]">
              화
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white">화목 매니저</p>
              <p className="mt-1 text-xs font-semibold text-white/48">강남본점</p>
            </div>
          </div>

          <nav className="mt-7 grid gap-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const selected = item.key === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hm-link-focus group relative flex min-h-12 items-center gap-3 rounded-[14px] px-3 text-sm font-bold text-white/68 transition hover:bg-white/[0.045] hover:text-[var(--hm-primary)]",
                    selected &&
                      "bg-[linear-gradient(90deg,rgba(247,230,193,.19),rgba(184,130,30,.08))] text-[var(--hm-primary)]",
                  )}
                >
                  {selected ? (
                    <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-[var(--hm-primary)]" />
                  ) : null}
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto grid gap-2 border-t border-[rgba(255,255,255,.06)] pt-5">
            <Link
              href="/store"
              className="hm-link-focus flex min-h-12 items-center justify-between rounded-[14px] border border-[rgba(247,230,193,.28)] px-4 text-sm font-bold text-[var(--hm-primary)]"
            >
              <span className="flex items-center gap-3">
                <Store size={17} aria-hidden="true" />
                매장 선택
              </span>
              <ChevronDown size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="hm-link-focus flex min-h-11 items-center gap-3 rounded-[14px] px-4 text-sm font-semibold text-white/54 transition hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut size={17} aria-hidden="true" />
              관리자 나가기
            </Link>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-[rgba(255,255,255,.08)] bg-[rgba(14,14,14,.72)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] md:flex-row md:items-center md:justify-between xl:bg-transparent xl:p-0 xl:shadow-none xl:border-0">
            <div>
              {backHref ? (
                <Link
                  href={backHref}
                  className="hm-link-focus mb-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,.12)] bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-white/62 transition hover:border-[rgba(247,230,193,.34)] hover:text-[var(--hm-primary)]"
                >
                  <ArrowLeft size={13} aria-hidden="true" />
                  {backLabel ?? "돌아가기"}
                </Link>
              ) : null}
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--hm-accent-gold)]">Admin Console</p>
              <h1 className="hm-serif mt-2 text-[32px] font-bold leading-tight text-[var(--hm-primary)] md:text-[40px]">
                {title}
              </h1>
              <p className="mt-2 text-sm font-medium leading-6 text-white/58">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white/74">
              <span>{today}</span>
              <span className="hidden h-4 w-px bg-white/14 md:block" />
              <span>28°C</span>
              <AdminNotificationCenter notifications={notifications} />
            </div>
          </div>

          <AdminMobileNav active={active} />

          {children}
        </section>
      </div>
    </main>
  );
}

export function AdminPanel({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-[rgba(255,255,255,.09)] bg-[linear-gradient(145deg,rgba(35,35,35,.82),rgba(18,18,18,.92))] shadow-[0_24px_70px_rgba(0,0,0,.28)]",
        className,
      )}
      {...props}
    />
  );
}

export function AdminPanelHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(255,255,255,.06)] px-5 py-4">
      <h2 className="text-[17px] font-extrabold text-white">{title}</h2>
      {action}
    </div>
  );
}

export function AdminStatCard({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  detail: ReactNode;
  href?: string;
}) {
  const card = (
    <AdminPanel className="p-4 transition hover:-translate-y-1 hover:border-[rgba(247,230,193,.22)] md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[rgba(184,130,30,.28)] text-[var(--hm-primary)] md:h-12 md:w-12 md:rounded-[16px]">
          {icon}
        </div>
        <span className="text-white/45">›</span>
      </div>
      <p className="mt-3 text-[13px] font-semibold text-white/68 md:mt-4 md:text-sm">{label}</p>
      <div className="mt-1.5 text-[22px] font-extrabold leading-none text-[var(--hm-primary)] md:mt-2 md:text-[28px]">
        {value}
      </div>
      <p className="mt-2.5 text-[11px] font-semibold leading-5 text-white/45 md:mt-4 md:text-xs">{detail}</p>
    </AdminPanel>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="hm-link-focus block">
      {card}
    </Link>
  );
}

export function AdminActionLink({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "hm-link-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(247,230,193,.2)] bg-white/[0.025] px-4 text-sm font-bold text-white/78 transition hover:border-[var(--hm-primary)] hover:bg-[var(--hm-primary)] hover:text-[#0d0d0d]",
        className,
      )}
      {...props}
    />
  );
}
