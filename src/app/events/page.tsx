import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const eventImages = [
  "/images/brand/brand-fire-wall.png",
  "/images/menu/1783221305281.png",
  "/images/brand/brand-storefront.png",
];

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "event")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  const events = (rows ?? []).map(mapContentPost);

  return (
    <main className="py-[120px]">
      <Container className="grid gap-8">
        <SectionHeading
          eyebrow="EVENT"
          title="이벤트"
          description="화목의 계절 메뉴, 매장 소식, 회원 혜택을 차분하게 전합니다."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, index) => (
            <Link key={event.id} href={`/events/${event.id}`} className="hm-link-focus group">
              <Card className="h-full overflow-hidden hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/2.6] overflow-hidden">
                    <Image
                      src={eventImages[index % eventImages.length]}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="grid gap-3 p-6">
                    <p className="flex items-center gap-2 text-sm text-[var(--hm-accent-gold)]">
                      <CalendarDays size={16} aria-hidden="true" />
                      {formatDate(event.publishedAt ?? event.createdAt)}
                    </p>
                    <h2 className="text-xl font-bold text-[var(--hm-text)]">{event.title}</h2>
                    <p className="line-clamp-3 text-sm leading-6 text-[var(--hm-subtext)]">
                      {event.body}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                      자세히 보기
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {events.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                  진행 중인 이벤트가 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
        <div>
          <ButtonLink href="/coupons" variant="outline">
            쿠폰 확인하기
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
