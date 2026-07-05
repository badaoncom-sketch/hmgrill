import { notFound } from "next/navigation";
import { ArrowLeft, Check, Flame } from "lucide-react";
import { MenuImage } from "@/components/menu-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { mapMenuItem, menuItemSelect } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export default async function MenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_items")
    .select(menuItemSelect)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!data) {
    notFound();
  }

  const item = mapMenuItem(data);

  return (
    <main className="py-[120px]">
      <Container className="grid gap-8">
        <ButtonLink href="/menu" variant="ghost" className="w-fit px-0">
          <ArrowLeft size={16} aria-hidden="true" />
          메뉴로 돌아가기
        </ButtonLink>
        <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
          <MenuImage src={item.imageUrl} alt={item.name} priority />
          <Card>
            <CardContent className="grid gap-6">
              <div>
                <Badge tone={item.featured ? "amber" : "neutral"}>{item.category}</Badge>
                <h1 className="hm-serif mt-5 text-3xl font-bold text-[var(--hm-primary)] sm:text-4xl">
                  {item.name}
                </h1>
                <p className="mt-3 text-2xl font-bold text-white">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <p className="leading-8 text-[var(--hm-subtext)]">{item.description}</p>
              <div className="grid gap-3 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-5 text-sm text-[var(--hm-subtext)]">
                <p className="flex items-center gap-2">
                  <Check size={16} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  참나무 장작의 온기와 은은한 향
                </p>
                <p className="flex items-center gap-2">
                  <Check size={16} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  숙성 고기의 결을 살리는 굽기
                </p>
                <p className="flex items-center gap-2">
                  <Check size={16} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  곁들임과 함께 즐기는 균형 있는 구성
                </p>
              </div>
              <ButtonLink href="/coupons">
                방문 혜택 확인
              </ButtonLink>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <Card>
            <CardContent>
              <Flame className="text-[var(--hm-accent-gold)]" size={28} aria-hidden="true" />
              <h2 className="hm-serif mt-4 text-2xl font-bold text-[var(--hm-primary)]">
                상세 설명
              </h2>
              <p className="mt-4 leading-8 text-[var(--hm-subtext)]">
                화목의 메뉴는 장작불의 향, 숙성의 시간, 굽는 손길이 하나로 이어지도록
                설계됩니다. 과한 양념보다 고기의 온도와 향을 중심에 둡니다.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h2 className="hm-serif text-2xl font-bold text-[var(--hm-primary)]">
                원산지 및 구성
              </h2>
              <div className="mt-5 grid gap-3 text-sm text-[var(--hm-subtext)] sm:grid-cols-3">
                <p className="rounded-[16px] bg-[var(--hm-surface)] p-4">원산지: 매장 공지 기준</p>
                <p className="rounded-[16px] bg-[var(--hm-surface)] p-4">구성: 고기, 곁들임</p>
                <p className="rounded-[16px] bg-[var(--hm-surface)] p-4">알레르기: 직원 문의</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </Container>
    </main>
  );
}
