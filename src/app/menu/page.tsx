import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { MenuCard } from "@/components/menu-card";
import { Container } from "@/components/ui/layout";
import { mapMenuItem, menuItemSelect } from "@/lib/content/db";
import type { MenuItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

// 관리자(SEO 관리)에서 제목·설명·공유 이미지를 수정할 수 있다.
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("menu");
}

// 카테고리 테이블이 비어 있을 때만 쓰는 예비 순서
const fallbackCategoryOrder = ["대표메뉴", "세트메뉴", "사이드", "음료", "전체메뉴"];

function groupByCategory(items: MenuItem[], categoryOrder: string[]) {
  const grouped = new Map<string, MenuItem[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }
  const preferred = categoryOrder.length > 0 ? categoryOrder : fallbackCategoryOrder;
  const ordered = [
    ...preferred.filter((category) => grouped.has(category)),
    ...Array.from(grouped.keys()).filter(
      (category) => !preferred.includes(category),
    ),
  ];
  return ordered.map((category) => ({
    category,
    items: grouped.get(category) ?? [],
  }));
}

export default async function MenuPage() {
  const supabase = await createClient();
  const [{ data: rows }, { data: categoryRows }, { data: copyRow }] = await Promise.all([
    supabase
      .from("menu_items")
      .select(menuItemSelect)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("menu_categories")
      .select("name")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("site_copy").select("title,body").eq("key", "menu").maybeSingle(),
  ]);
  const menuItems = (rows ?? []).map(mapMenuItem);
  const categoryOrder = (categoryRows ?? []).map((row) => row.name);
  const menuSections = groupByCategory(menuItems, categoryOrder);
  const pageTitle = copyRow?.title ?? "화목의 메뉴";
  const pageBody =
    copyRow?.body ??
    "장작불의 온기, 숙성 고기의 깊이, 구운 채소와 곁들임의 균형을 담았습니다.";

  return (
    <main className="hm-page-main">
      <Container>
        <div className="max-w-2xl">
          <p className="hm-eyebrow">Menu</p>
          <h1 className="hm-section-title mt-5">{pageTitle}</h1>
          {pageBody ? (
            <p className="hm-body mt-5 text-[var(--hm-subtext)]">{pageBody}</p>
          ) : null}
        </div>

        {menuSections.length > 0 ? (
          <nav
            aria-label="메뉴 카테고리"
            className="sticky top-16 z-30 mt-10 -mx-5 bg-[rgba(13,13,13,.88)] px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:top-20"
          >
            <div className="flex gap-2 overflow-x-auto pb-1">
              {menuSections.map((section, index) => (
                <a
                  key={section.category}
                  href={`#category-${index}`}
                  className="hm-link-focus flex shrink-0 items-center gap-2 rounded-full border border-[var(--hm-border)] bg-[var(--hm-card)] px-5 py-2.5 text-sm font-semibold text-[var(--hm-subtext)] transition hover:border-[rgba(247,230,193,.32)] hover:text-[var(--hm-primary)]"
                >
                  {section.category}
                  <span className="font-mono text-[11px] text-[var(--hm-accent-gold)]">
                    {section.items.length}
                  </span>
                </a>
              ))}
            </div>
          </nav>
        ) : null}

        <div className="mt-12 grid gap-16 lg:gap-20">
          {menuSections.map((section, index) => (
            <section
              key={section.category}
              id={`category-${index}`}
              className="scroll-mt-40"
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-5">
                <h2 className="hm-subsection-title">{section.category}</h2>
                <p className="font-mono text-[13px] tracking-[0.12em] text-[var(--hm-accent-gold)]">
                  {String(section.items.length).padStart(2, "0")}
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {section.items.map((item, itemIndex) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    priority={index === 0 && itemIndex < 3}
                  />
                ))}
              </div>
            </section>
          ))}

          {menuItems.length === 0 ? (
            <div className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
              <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                등록된 메뉴가 없습니다.
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
