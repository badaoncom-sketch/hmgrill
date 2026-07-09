import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  fetchSiteSettings,
  type SiteSettingKey,
  type SiteSettings,
} from "@/lib/site-settings";

// 관리자 SEO 설정과 페이지 메타데이터가 함께 쓰는 페이지 목록.
export const seoPages = [
  { key: "home", path: "/", label: "메인" },
  { key: "about", path: "/about", label: "화목 소개" },
  { key: "menu", path: "/menu", label: "메뉴" },
  { key: "coupons", path: "/coupons", label: "방문 혜택" },
  { key: "events", path: "/events", label: "이벤트" },
  { key: "store", path: "/store", label: "매장 안내" },
  { key: "support", path: "/support", label: "고객센터" },
  { key: "notices", path: "/notices", label: "공지사항" },
] as const;

export type SeoPageKey = (typeof seoPages)[number]["key"];

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function settingValue(settings: SiteSettings, key: string) {
  return settings[key as SiteSettingKey] ?? "";
}

export function pageMetadataFromSettings(
  settings: SiteSettings,
  page: SeoPageKey,
): Metadata {
  const path = seoPages.find((item) => item.key === page)?.path ?? "/";
  const title = settingValue(settings, `seo.${page}.title`);
  const description = settingValue(settings, `seo.${page}.description`);
  const ogImage =
    settingValue(settings, `seo.${page}.og_image`) ||
    settings["seo.site.og_image"];

  return {
    // 메인은 레이아웃 기본 제목(사이트명)을 그대로 쓰고, 나머지는 "%s | 화목" 템플릿을 탄다.
    ...(page === "home" ? { title: { absolute: title } } : { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// 공개 페이지의 generateMetadata에서 호출한다. 관리자 설정이 없으면 기본값이 적용된다.
export async function buildPageMetadata(page: SeoPageKey): Promise<Metadata> {
  const supabase = await createClient();
  const settings = await fetchSiteSettings(supabase);
  return pageMetadataFromSettings(settings, page);
}

// 상세 페이지(메뉴·이벤트·공지)용 메타데이터.
export function detailMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
}): Metadata {
  const cleanDescription = description
    ?.replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title,
    ...(cleanDescription ? { description: cleanDescription } : {}),
    alternates: { canonical: path },
    openGraph: {
      title,
      ...(cleanDescription ? { description: cleanDescription } : {}),
      url: path,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      ...(image ? { images: [image] } : {}),
    },
  };
}
