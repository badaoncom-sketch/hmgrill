import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { eventImages } from "@/lib/site-data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_posts")
    .select("title")
    .eq("type", "event")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.title ?? "이벤트" };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "event")
    .eq("id", id)
    .single();

  if (!data) {
    notFound();
  }

  const event = mapContentPost(data);

  const { data: otherRows } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "event")
    .neq("id", id)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(3);
  const otherEvents = (otherRows ?? []).map(mapContentPost);

  return (
    <main className="hm-page-main">
      <Container>
        <ButtonLink href="/events" variant="ghost" className="-ml-3 w-fit">
          <ArrowLeft size={16} aria-hidden="true" />
          이벤트 목록
        </ButtonLink>

        <article className="mt-8">
          <header className="max-w-3xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--hm-accent-gold)]">
              <CalendarDays size={16} aria-hidden="true" />
              {formatDate(event.publishedAt ?? event.createdAt)}
            </p>
            <h1 className="hm-section-title mt-4">{event.title}</h1>
          </header>

          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[24px] border border-[var(--hm-border)] shadow-[var(--hm-shadow-strong)] lg:aspect-[21/9]">
            <Image
              src={eventImages[0]}
              alt={event.title}
              fill
              priority
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(13,13,13,.45))]" />
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="hm-body-lg whitespace-pre-line text-[var(--hm-subtext)]">
              {event.body}
            </p>
          </div>
        </article>

        <section className="mt-14 overflow-hidden rounded-[24px] border border-[var(--hm-warm-border)] bg-[radial-gradient(60%_120%_at_50%_0%,rgba(184,130,30,.1),transparent_70%),var(--hm-surface)] px-8 py-12 text-center">
          <p className="hm-eyebrow">Benefit</p>
          <h2 className="hm-subsection-title mt-4">이 소식과 함께, 방문 혜택도 챙기세요</h2>
          <p className="hm-body mx-auto mt-4 max-w-md text-[var(--hm-subtext)]">
            발행 중인 쿠폰을 미리 다운로드해 두면 매장에서 바로 사용할 수 있습니다.
          </p>
          <ButtonLink href="/coupons" className="mt-8">
            쿠폰 확인하기
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </section>

        {otherEvents.length > 0 ? (
          <section className="mt-16 border-t border-[var(--hm-warm-border)] pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="hm-eyebrow">More</p>
                <h2 className="hm-subsection-title mt-4">다른 소식</h2>
              </div>
              <ButtonLink
                href="/events"
                variant="ghost"
                className="shrink-0 px-0 text-[15px] font-bold text-[var(--hm-primary)]"
              >
                전체 보기
                <ArrowRight size={15} aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {otherEvents.map((other, index) => (
                <Link
                  key={other.id}
                  href={`/events/${other.id}`}
                  className="hm-link-focus group block h-full"
                >
                  <article className="hm-card-hover flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
                    <div className="hm-image-zoom relative aspect-[4/2.6] overflow-hidden">
                      <Image
                        src={eventImages[(index + 1) % eventImages.length]}
                        alt={other.title}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <p className="flex items-center gap-2 text-sm text-[var(--hm-accent-gold)]">
                        <CalendarDays size={16} aria-hidden="true" />
                        {formatDate(other.publishedAt ?? other.createdAt)}
                      </p>
                      <h3 className="hm-card-title">{other.title}</h3>
                      <p className="hm-caption line-clamp-2 text-[var(--hm-subtext)]">
                        {other.body}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
