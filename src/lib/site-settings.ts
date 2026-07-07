import type { SupabaseClient } from "@supabase/supabase-js";

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
} as const;

export type SiteSettingKey = keyof typeof siteSettingDefaults;

export const siteSettingKeys = Object.keys(
  siteSettingDefaults,
) as SiteSettingKey[];

export type SiteSettings = Record<SiteSettingKey, string>;

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
