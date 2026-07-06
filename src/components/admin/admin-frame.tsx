import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MenuSquare,
  MessageSquareText,
  Settings,
  Store,
  Ticket,
  UserRound,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, key: "dashboard" },
  { href: "/admin/coupons", label: "쿠폰 관리", icon: Ticket, key: "coupons" },
  { href: "/admin/members", label: "회원 관리", icon: UsersRound, key: "members" },
  { href: "/admin/staff", label: "직원 관리", icon: UserRound, key: "staff" },
  { href: "/admin/menu", label: "메뉴 관리", icon: MenuSquare, key: "menu" },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarDays, key: "events" },
  { href: "/admin/notices", label: "공지사항", icon: Bell, key: "notices" },
  { href: "/admin/inquiries", label: "문의 관리", icon: MessageSquareText, key: "inquiries" },
  { href: "/admin/banners", label: "배너 관리", icon: ClipboardList, key: "banners" },
  { href: "/admin/popups", label: "팝업 관리", icon: Settings, key: "popups" },
  { href: "/admin/reports", label: "통계 리포트", icon: BarChart3, key: "reports" },
] as const;

type AdminNavKey = (typeof adminNavItems)[number]["key"];

export type AdminNotification = {
  title: string;
  description: string;
  href: string;
  tone?: "amber" | "red" | "green";
};

const defaultNotifications: AdminNotification[] = [
  {
    title: "운영 현황 확인",
    description: "대시보드에서 쿠폰, 문의, 콘텐츠 상태를 점검합니다.",
    href: "/admin",
    tone: "amber",
  },
  {
    title: "공지사항 관리",
    description: "고객에게 노출되는 안내를 최신 상태로 유지합니다.",
    href: "/admin/notices",
  },
  {
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
  notifications = defaultNotifications,
  children,
}: {
  active: AdminNavKey;
  title: string;
  description: string;
  notifications?: AdminNotification[];
  children: ReactNode;
}) {
  const today = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_70%_0%,rgba(184,130,30,.08),transparent_34%),linear-gradient(135deg,#0d0d0d,#080808)] px-4 py-6 text-white md:px-6">
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
              <div className="group relative">
                <button
                  type="button"
                  aria-label="관리자 알림"
                  className="hm-link-focus relative grid h-11 w-11 place-items-center rounded-[14px] border border-[rgba(255,255,255,.09)] bg-white/[0.035] text-[var(--hm-primary)] transition hover:border-[rgba(247,230,193,.28)] hover:bg-white/[0.06]"
                >
                  <Bell size={19} aria-hidden="true" />
                  {notifications.length > 0 ? (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--hm-accent-red)]" />
                  ) : null}
                </button>
                <div className="invisible absolute right-0 top-[calc(100%+10px)] z-50 w-[min(360px,calc(100vw-32px))] translate-y-2 rounded-[20px] border border-[rgba(255,255,255,.1)] bg-[linear-gradient(145deg,rgba(24,24,24,.98),rgba(10,10,10,.98))] p-2 opacity-0 shadow-[0_28px_80px_rgba(0,0,0,.5)] transition group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="border-b border-[rgba(255,255,255,.06)] px-3 py-3">
                    <p className="text-sm font-extrabold text-white">알림</p>
                    <p className="mt-1 text-xs font-semibold text-white/42">
                      운영자가 바로 확인할 항목입니다.
                    </p>
                  </div>
                  <div className="grid py-2">
                    {notifications.map((item) => (
                      <Link
                        key={`${item.href}-${item.title}`}
                        href={item.href}
                        className="hm-link-focus grid gap-1 rounded-[14px] px-3 py-3 text-left transition hover:bg-white/[0.045]"
                      >
                        <span className="flex items-center gap-2 text-sm font-extrabold text-white">
                          <i
                            className={cn(
                              "h-2 w-2 rounded-full",
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
                    ))}
                    {notifications.length === 0 ? (
                      <p className="px-3 py-5 text-sm font-semibold text-white/42">
                        새 알림이 없습니다.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="mb-5 flex gap-2 overflow-x-auto rounded-[20px] border border-[rgba(255,255,255,.08)] bg-black/30 p-2 xl:hidden">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const selected = item.key === active;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "hm-link-focus inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[14px] px-3 text-xs font-extrabold text-white/58 transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)]",
                    selected &&
                      "bg-[var(--hm-primary)] text-[#0d0d0d] hover:bg-[var(--hm-primary)] hover:text-[#0d0d0d]",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

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
    <AdminPanel className="p-5 transition hover:-translate-y-1 hover:border-[rgba(247,230,193,.22)]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] border border-[rgba(184,130,30,.28)] text-[var(--hm-primary)]">
          {icon}
        </div>
        <span className="text-white/45">›</span>
      </div>
      <p className="mt-4 text-sm font-semibold text-white/68">{label}</p>
      <div className="mt-2 text-[28px] font-extrabold leading-none text-[var(--hm-primary)]">
        {value}
      </div>
      <p className="mt-4 text-xs font-semibold leading-5 text-white/45">{detail}</p>
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
