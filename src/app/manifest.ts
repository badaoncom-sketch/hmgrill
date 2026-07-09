import type { MetadataRoute } from "next";
import { fetchSiteSettings } from "@/lib/site-settings";
import { createAdminClient } from "@/lib/supabase/admin";

// 관리자(SEO 관리 → 앱 설치 설정)에서 바꾼 이름·아이콘이 접속 시 반영되도록 주기적으로 재생성한다.
export const revalidate = 300;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await fetchSiteSettings(createAdminClient());
  const icon = settings["app.icon"];

  return {
    name: settings["app.name"],
    short_name: settings["app.short_name"],
    description: settings["seo.site.description"],
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0d",
    theme_color: "#0d0d0d",
    icons: [
      {
        src: icon,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icon,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
