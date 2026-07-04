import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { menuItems } from "@/lib/site-data";
import { formatCurrency } from "@/lib/utils";

const categories = ["대표메뉴", "전체메뉴", "세트메뉴", "사이드", "음료"];

export default function MenuPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="MENU"
        title="메뉴"
        description="대표메뉴, 전체메뉴, 세트메뉴, 사이드, 음료 카테고리를 기획서 기준으로 구성했습니다."
      />
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge key={category}>{category}</Badge>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {menuItems.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <Badge tone={item.featured ? "red" : "neutral"}>
                {item.category}
              </Badge>
              <h2 className="mt-3 text-xl font-bold text-neutral-950">
                {item.name}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                {item.description}
              </p>
              <p className="mt-4 text-lg font-bold text-neutral-950">
                {formatCurrency(item.price)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
