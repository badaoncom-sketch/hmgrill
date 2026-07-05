import Link from "next/link";
import { MenuImage } from "@/components/menu-image";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { mapMenuItem, menuItemSelect } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

const baseCategories = ["전체", "대표메뉴", "소고기", "돼지고기", "사이드", "식사", "주류"];

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("menu_items")
    .select(menuItemSelect)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const menuItems = (rows ?? []).map(mapMenuItem);
  const categories = Array.from(
    new Set([...baseCategories, ...menuItems.map((item) => item.category)]),
  );

  return (
    <main className="hm-page-main">
      <Container className="grid gap-10">
        <SectionHeading
          eyebrow="MENU"
          title="메뉴"
          description="장작불의 온기, 숙성 고기의 깊이, 구운 채소와 곁들임의 균형을 담은 화목의 메뉴입니다."
        />
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)] p-3">
              {categories.map((category, index) => (
                <a
                  key={category}
                  href={index === 0 ? "#menu-grid" : `#category-${index}`}
                  className="hm-link-focus flex rounded-[14px] px-4 py-3 text-sm font-semibold text-[var(--hm-subtext)] transition hover:bg-white/[0.04] hover:text-[var(--hm-primary)] first:bg-[var(--hm-primary)] first:text-[var(--hm-background)]"
                >
                  {category}
                </a>
              ))}
            </div>
          </aside>

          <section id="menu-grid" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {menuItems.map((item, index) => (
              <Link key={item.id} href={`/menu/${item.id}`} className="hm-link-focus group">
                <Card className="h-full overflow-hidden hover:-translate-y-1">
                  <CardContent className="p-0">
                    <MenuImage src={item.imageUrl} alt={item.name} priority={index < 4} />
                    <div className="grid gap-3 p-5">
                      <Badge tone={item.featured ? "amber" : "neutral"}>
                        {item.category}
                      </Badge>
                      <h2 className="text-lg font-bold text-[var(--hm-text)]">{item.name}</h2>
                      <p className="min-h-12 text-sm leading-6 text-[var(--hm-subtext)]">
                        {item.description}
                      </p>
                      <p className="text-lg font-bold text-[var(--hm-primary)]">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {menuItems.length === 0 ? (
              <Card>
                <CardContent>
                  <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                    등록된 메뉴가 없습니다.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>
      </Container>
    </main>
  );
}
