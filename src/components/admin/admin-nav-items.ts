import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Globe,
  Home,
  Inbox,
  LayoutDashboard,
  MenuSquare,
  MessageSquareText,
  Settings,
  Ticket,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

// 관리자 콘솔 네비게이션 — 사이드바(서버)와 모바일 네비(클라이언트)가 공유한다.
export const adminNavItems: readonly {
  href: string;
  label: string;
  icon: LucideIcon;
  key: string;
}[] = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, key: "dashboard" },
  { href: "/admin/home", label: "홈페이지 관리", icon: Home, key: "home" },
  { href: "/admin/seo", label: "SEO 관리", icon: Globe, key: "seo" },
  { href: "/admin/notifications", label: "알림함", icon: Inbox, key: "notifications" },
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
];

export type AdminNavKey = (typeof adminNavItems)[number]["key"];
