import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

// 새로 공개된 메뉴·이벤트·공지가 자동 반영되도록 1시간마다 다시 생성한다.
export const revalidate = 3600;

const staticPages: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/menu", priority: 0.9, changeFrequency: "weekly" },
  { path: "/coupons", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/events", priority: 0.8, changeFrequency: "weekly" },
  { path: "/store", priority: 0.8, changeFrequency: "monthly" },
  { path: "/support", priority: 0.6, changeFrequency: "monthly" },
  { path: "/notices", priority: 0.6, changeFrequency: "weekly" },
  { path: "/terms", priority: 0.2, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "monthly" },
];

// 공개 중인 메뉴·이벤트·공지 상세까지 포함한 동적 사이트맵.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const admin = createAdminClient();

  const [{ data: menuRows }, { data: postRows }] = await Promise.all([
    admin
      .from("menu_items")
      .select("id,updated_at,created_at")
      .eq("is_active", true),
    admin
      .from("content_posts")
      .select("id,type,updated_at,created_at")
      .in("type", ["event", "notice"])
      // service-role은 RLS를 우회하므로 공개 상태를 직접 걸러낸다.
      .eq("status", "published"),
  ]);

  const entries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${base}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  for (const row of menuRows ?? []) {
    entries.push({
      url: `${base}/menu/${row.id}`,
      lastModified: new Date(row.updated_at ?? row.created_at),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const row of postRows ?? []) {
    entries.push({
      url: `${base}/${row.type === "event" ? "events" : "notices"}/${row.id}`,
      lastModified: new Date(row.updated_at ?? row.created_at),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return entries;
}
