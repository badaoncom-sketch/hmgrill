import { MenuImage } from "@/components/menu-image";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mapMenuItem, menuItemSelect } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

const categories = ["대표메뉴", "전체메뉴", "세트메뉴", "사이드", "음료"];

export default async function MenuPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("menu_items")
    .select(menuItemSelect)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const menuItems = (rows ?? []).map(mapMenuItem);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="MENU"
        title="메뉴"
        description="장작불의 온기, 숙성 고기의 깊이, 구운 채소와 곁들임의 균형을 담은 화목의 메뉴입니다."
      />
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge key={category}>{category}</Badge>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
          >
            <CardContent className="grid gap-4">
              <MenuImage src={item.imageUrl} alt={item.name} />
              <Badge tone={item.featured ? "red" : "neutral"}>
                {item.category}
              </Badge>
              <h2 className="text-xl font-bold text-[#17130f]">{item.name}</h2>
              <p className="text-sm leading-6 text-[#5f554a]">
                {item.description}
              </p>
              <p className="text-lg font-bold text-[#17130f]">
                {formatCurrency(item.price)}
              </p>
            </CardContent>
          </Card>
        ))}
        {menuItems.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm font-semibold text-[#5f554a]">
                등록된 메뉴가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
