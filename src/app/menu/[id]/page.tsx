import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Utensils } from "lucide-react";
import { MenuCard } from "@/components/menu-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { mapMenuItem, menuItemSelect } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_items")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.name ?? "메뉴" };
}

const highlights = [
  "참나무 장작의 온기와 은은한 향",
  "숙성 고기의 결을 살리는 굽기",
  "곁들임과 함께 즐기는 균형 있는 구성",
];

const servingNotes = [
  { label: "원산지", value: "매장 공지 기준" },
  { label: "구성", value: "고기, 곁들임" },
  { label: "알레르기", value: "직원에게 문의해 주세요" },
];

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

  const { data: otherRows } = await supabase
    .from("menu_items")
    .select(menuItemSelect)
    .eq("is_active", true)
    .neq("id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const others = (otherRows ?? []).map(mapMenuItem);
  const related = [
    ...others.filter((other) => other.category === item.category),
    ...others.filter((other) => other.category !== item.category),
  ].slice(0, 3);

  return (
    <main className="hm-page-main">
      <Container>
        <ButtonLink href="/menu" variant="ghost" className="-ml-3 w-fit">
          <ArrowLeft size={16} aria-hidden="true" />
          메뉴 목록
        </ButtonLink>

        <section className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-start lg:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-card)] shadow-[var(--hm-shadow-strong)] lg:sticky lg:top-28">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-[var(--hm-subtext)]">
                <Utensils size={36} aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,rgba(13,13,13,.35))]" />
          </div>

          <div>
            <Badge tone={item.featured ? "amber" : "neutral"} className="w-fit">
              {item.featured ? "대표 메뉴" : item.category}
            </Badge>
            <h1 className="hm-section-title mt-5">{item.name}</h1>
            <p className="mt-4 text-[28px] font-bold leading-none text-[var(--hm-primary)]">
              {formatCurrency(item.price)}
            </p>
            <p className="hm-body mt-6 text-[var(--hm-subtext)]">{item.description}</p>

            <ul className="mt-9 border-t border-[var(--hm-border)]">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-center gap-3 border-b border-[var(--hm-border)] py-4 text-sm font-medium text-[var(--hm-subtext)]"
                >
                  <Check size={16} className="shrink-0 text-[var(--hm-accent-gold)]" aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/coupons">방문 혜택 확인</ButtonLink>
              <ButtonLink href="/store" variant="outline">
                매장 안내
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-10 border-t border-[var(--hm-warm-border)] pt-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="hm-eyebrow">Note</p>
            <h2 className="hm-subsection-title mt-4">화목의 굽는 방식</h2>
            <p className="hm-body mt-4 text-[var(--hm-subtext)]">
              화목의 메뉴는 장작불의 향, 숙성의 시간, 굽는 손길이 하나로 이어지도록
              설계됩니다. 과한 양념보다 고기의 온도와 향을 중심에 둡니다.
            </p>
          </div>
          <dl className="self-start border-t border-[var(--hm-border)]">
            {servingNotes.map((note) => (
              <div
                key={note.label}
                className="flex items-baseline justify-between gap-6 border-b border-[var(--hm-border)] py-4"
              >
                <dt className="shrink-0 text-sm font-bold text-[var(--hm-text)]">{note.label}</dt>
                <dd className="text-right text-sm text-[var(--hm-subtext)]">{note.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-[var(--hm-warm-border)] pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="hm-eyebrow">More</p>
                <h2 className="hm-subsection-title mt-4">함께 보면 좋은 메뉴</h2>
              </div>
              <ButtonLink
                href="/menu"
                variant="ghost"
                className="shrink-0 px-0 text-[15px] font-bold text-[var(--hm-primary)]"
              >
                전체 메뉴
                <ArrowRight size={15} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <MenuCard key={other.id} item={other} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
