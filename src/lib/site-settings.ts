import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// 홈페이지에서 관리자가 수정할 수 있는 키와 기본값.
// 값이 저장되지 않았거나 비워지면 기본값으로 돌아간다.
export const siteSettingDefaults = {
  "logo.image": "/images/brand/brand-logo-transparent.png",

  "hero.title_line1": "참나무 장작의 깊은 향,",
  "hero.title_line2": "화목의 시간",
  "hero.subtitle": "좋은 사람과 함께하는 시간.\n정성으로 구워낸 특별한 맛을 전합니다.",
  "hero.cta_label": "화목 둘러보기",
  "hero.cta_href": "/menu",
  "hero.image_desktop": "/images/brand/brand-hero-background.png",
  "hero.image_mobile": "/images/brand/brand-hero-mobile.png",

  "feature.1.title": "참나무 장작",
  "feature.1.desc": "입체적인 향과 온도로 고기의 결을 완성합니다.",
  "feature.2.title": "정성의 손길",
  "feature.2.desc": "숙성의 균형과 굽는 시간을 섬세하게 맞춥니다.",
  "feature.3.title": "최상급 재료",
  "feature.3.desc": "신선하고 품격 있는 재료를 엄선해 사용합니다.",
  "feature.4.title": "소중한 시간",
  "feature.4.desc": "좋은 사람과 머무는 시간을 깊게 만듭니다.",

  "about.title": "화목, 그 특별한 이야기",
  "about.body":
    "화목은 참나무 장작구이를 통해 음식 본연의 맛과 향을 살리고, 좋은 사람들과 함께하는 소중한 시간을 만들어가는 공간입니다.",
  "about.image_main": "/images/brand/brand-storefront.png",
  "about.image_sub": "/images/brand/brand-fire-wall.png",

  "store.body": "장작불의 온기와 차분한 조명을 중심으로 설계한 화목의 대표 공간입니다.",
  "store.image": "/images/brand/brand-storefront.png",

  "instagram.1": "/images/menu/1783221305383.png",
  "instagram.2": "/images/brand/brand-fire-wall.png",
  "instagram.3": "/images/brand/brand-storefront.png",
  "instagram.4": "/images/menu/1783221305470.png",
  "instagram.5": "/images/menu/1783221305545.png",
  "instagram.6": "/images/menu/1783221305205.png",
  "instagram.7": "/images/brand/brand-sign-collage.jpg",
  "instagram.8": "/images/menu/1783221305136.png",

  "footer.eyebrow": "Hwamok · 참나무 장작구이",
  "footer.tagline": "참나무 장작의 깊은 향,\n화목의 시간",

  // ── 앱 설치(PWA): 홈 화면 아이콘과 이름 ──
  "app.name": "화목 · 참나무 장작구이",
  "app.short_name": "화목",
  "app.icon": "/icons/icon-512.png",

  // ── 앱 시작 화면: 설치된 앱을 여는 동안 표시되는 로딩 화면 ──
  "app.splash.image": "/images/brand/brand-logo-transparent.png",
  "app.splash.tagline": "참나무 장작의 깊은 향,\n화목의 시간",

  // ── 카카오톡 공유: developers.kakao.com 앱의 JavaScript 키 ──
  // 키가 저장되면 쿠폰 페이지에 카카오톡 공유 버튼이 나타난다.
  "share.kakao_js_key": "",

  // ── SEO: 사이트 기본값 ──
  "seo.site.title": "화목 · 참나무 장작구이",
  "seo.site.description":
    "부산 동래구 참나무 장작구이 전문점 화목. 장작불의 온기로 구워낸 고기와 방문 혜택 QR 쿠폰을 만나보세요.",
  "seo.site.keywords": "참나무 장작구이, 부산 맛집, 동래구 고기집, 장작구이, 화목",
  "seo.site.og_image": "/images/brand/brand-hero-background.png",

  // ── SEO: 페이지별 (제목·설명·공유 이미지) ──
  "seo.home.title": "화목 · 참나무 장작구이",
  "seo.home.description":
    "참나무 장작의 깊은 향, 화목의 시간. 부산 동래구 장작구이 전문점 화목의 메뉴와 방문 혜택을 확인하세요.",
  "seo.home.og_image": "/images/brand/brand-hero-background.png",
  "seo.about.title": "화목 소개",
  "seo.about.description":
    "장작불의 온기로 고기를 연구하는 화목의 이야기. 참나무 장작구이에 담는 정성과 공간을 소개합니다.",
  "seo.about.og_image": "/images/brand/brand-storefront.png",
  "seo.menu.title": "메뉴",
  "seo.menu.description":
    "참나무 장작으로 구워내는 화목의 대표 메뉴. 숙성 고기와 곁들임 구성을 확인하세요.",
  "seo.menu.og_image": "/images/brand/brand-hero-background.png",
  "seo.coupons.title": "방문 혜택",
  "seo.coupons.description":
    "화목을 다시 찾는 회원을 위한 방문 혜택. 최초 1회 정보 입력으로 QR 할인 쿠폰을 바로 받으세요.",
  "seo.coupons.og_image": "/images/brand/brand-hero-background.png",
  "seo.events.title": "이벤트",
  "seo.events.description": "화목의 새로운 소식과 진행 중인 이벤트를 확인하세요.",
  "seo.events.og_image": "/images/brand/brand-hero-background.png",
  "seo.store.title": "매장 안내",
  "seo.store.description":
    "부산광역시 동래구 온천천로 447-2. 화목 매장의 위치, 영업시간, 오시는 길을 안내합니다.",
  "seo.store.og_image": "/images/brand/brand-storefront.png",
  "seo.support.title": "고객센터",
  "seo.support.description":
    "방문 전 궁금한 점을 빠르게 확인하고 문의를 남겨 주세요. 전화 051-1234-5678.",
  "seo.support.og_image": "/images/brand/brand-hero-background.png",
  "seo.notices.title": "공지사항",
  "seo.notices.description": "영업 안내, 이용 공지 등 방문 전 확인할 정보를 정리합니다.",
  "seo.notices.og_image": "/images/brand/brand-hero-background.png",
} as const;

export type SiteSettingKey = keyof typeof siteSettingDefaults;

export const siteSettingKeys = Object.keys(
  siteSettingDefaults,
) as SiteSettingKey[];

export type SiteSettings = Record<SiteSettingKey, string>;

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

// 레이아웃·메타데이터가 요청마다 DB를 기다리지 않도록 서버 캐시로 감싼다.
// 첫 화면(TTFB)이 빨라져 설치형 앱 실행 시 정적 스플래시가 떠 있는 시간이 줄어든다.
// 관리자 저장(updateSiteSettingsAction)이 태그를 무효화해 즉시 반영된다.
export const getCachedSiteSettings = unstable_cache(
  async () => fetchSiteSettings(createAdminClient()),
  [SITE_SETTINGS_CACHE_TAG],
  { revalidate: 300, tags: [SITE_SETTINGS_CACHE_TAG] },
);

export async function fetchSiteSettings(
  client: SupabaseClient,
): Promise<SiteSettings> {
  const { data } = await client
    .from("site_settings")
    .select("key,value")
    .in("key", siteSettingKeys);

  const settings = { ...siteSettingDefaults } as SiteSettings;
  for (const row of data ?? []) {
    const key = row.key as SiteSettingKey;
    if (key in siteSettingDefaults && typeof row.value === "string" && row.value.trim()) {
      settings[key] = row.value;
    }
  }
  return settings;
}
