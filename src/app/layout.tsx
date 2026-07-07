import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import type { HeaderUser } from "@/components/header-user-controls";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/site-header-client";
import {
  mapMemberNotification,
  memberNotificationSelect,
  type MemberNotification,
} from "@/lib/notifications/db";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-hm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-hm-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "화목",
    template: "%s | 화목",
  },
  description: "장작불의 온기로 고기를 연구하는 화목 장작구이",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let headerUser: HeaderUser | null = null;
  let notifications: MemberNotification[] = [];
  let unreadCount = 0;

  if (user) {
    // 만료 임박 쿠폰·새 공지/이벤트 알림을 사용자 단위로 채워 넣는다.
    const [{ data: profile }] = await Promise.all([
      supabase
        .from("profiles")
        .select("name,email,member_uid,role")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.rpc("sync_member_notifications"),
    ]);

    const [{ data: notificationRows }, { count }] = await Promise.all([
      supabase
        .from("member_notifications")
        .select(memberNotificationSelect)
        .eq("member_id", user.id)
        .is("archived_at", null)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("member_notifications")
        .select("id", { count: "exact", head: true })
        .eq("member_id", user.id)
        .is("read_at", null)
        .is("archived_at", null)
        .is("deleted_at", null),
    ]);

    headerUser = {
      name: profile?.name ?? null,
      email: profile?.email ?? user.email ?? "",
      memberUid: profile?.member_uid ?? null,
      role: profile?.role ?? "member",
    };
    notifications = (notificationRows ?? []).map(mapMemberNotification);
    unreadCount = count ?? 0;
  }

  return (
    <html lang="ko" className={`${notoSansKr.variable} ${notoSerifKr.variable} ${geistMono.variable}`}>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <SiteHeader user={headerUser} notifications={notifications} unreadCount={unreadCount} />
        <div className="hm-surface min-h-screen pt-16 md:pt-20">{children}</div>
        <SiteFooter />
        <MobileBottomNav />
      </body>
    </html>
  );
}
