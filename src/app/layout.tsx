import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist_Mono, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import type { HeaderUser } from "@/components/header-user-controls";
import { InstallPrompt } from "@/components/install-prompt";
import { LiveUpdates } from "@/components/live-updates";
import { NavigationProgress } from "@/components/navigation-progress";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { HideOnAdmin } from "@/components/route-chrome";
import { ScrollChrome } from "@/components/scroll-chrome";
import { ScrollToTopOnNav } from "@/components/scroll-to-top-on-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/site-header-client";
import { RestaurantStructuredData } from "@/components/structured-data";
import { getSiteUrl } from "@/lib/seo";
import {
  mapMemberNotification,
  memberNotificationSelect,
  type MemberNotification,
} from "@/lib/notifications/db";
import { fetchSiteSettings } from "@/lib/site-settings";
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

// 관리자 SEO 설정(사이트 제목·설명·키워드·대표 공유 이미지)을 전 페이지 기본값으로 쓴다.
export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const settings = await fetchSiteSettings(supabase);
  const siteTitle = settings["seo.site.title"];
  const description = settings["seo.site.description"];

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteTitle,
      template: "%s | 화목",
    },
    description,
    keywords: settings["seo.site.keywords"]
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: "화목",
      title: siteTitle,
      description,
      images: [{ url: settings["seo.site.og_image"] }],
    },
    twitter: {
      card: "summary_large_image",
    },
    // iOS 홈 화면 추가 시 관리자 설정 아이콘을 쓴다.
    icons: {
      apple: settings["app.icon"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: settings["app.short_name"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    settings,
  ] = await Promise.all([supabase.auth.getUser(), fetchSiteSettings(supabase)]);

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
        <RestaurantStructuredData settings={settings} />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <PullToRefresh />
        <SiteHeader
          user={headerUser}
          notifications={notifications}
          unreadCount={unreadCount}
          logoSrc={settings["logo.image"]}
        />
        <div className="hm-surface min-h-screen pt-16 md:pt-20">{children}</div>
        <HideOnAdmin>
          <SiteFooter
            eyebrow={settings["footer.eyebrow"]}
            tagline={settings["footer.tagline"]}
          />
        </HideOnAdmin>
        <MobileBottomNav user={headerUser} />
        <ScrollChrome />
        <Suspense fallback={null}>
          <ScrollToTopOnNav />
        </Suspense>
        <LiveUpdates />
        <InstallPrompt
          appName={settings["app.short_name"]}
          iconSrc={settings["app.icon"]}
        />
      </body>
    </html>
  );
}
