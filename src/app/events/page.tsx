import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { eventImages } from "@/lib/site-data";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "이벤트",
  description: "화목의 계절 메뉴, 매장 소식, 회원 혜택을 전합니다.",
};

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "event")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  const events = (rows ?? []).map(mapContentPost);
  const [featured, ...rest] = events;

  return (
    <main className="hm-page-main">
      <Container>
        <div className="max-w-2xl">
          <p className="hm-eyebrow">Event</p>
          <h1 className="hm-section-title mt-3 md:mt-5">이벤트</h1>
          <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">
            화목의 계절 메뉴, 매장 소식, 회원 혜택을 차분하게 전합니다.
          </p>
        </div>

        {featured ? (
          <Link
            href={`/events/${featured.id}`}
            className="hm-link-focus group mt-7 block md:mt-12"
          >
            <article className="hm-card-hover grid overflow-hidden rounded-[24px] border border-[var(--hm-border)] bg-[var(--hm-surface)] lg:grid-cols-[1.15fr_.85fr]">
              <div className="hm-image-zoom relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
                <Image
                  src={eventImages[0]}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.35))]" />
              </div>
              <div className="flex flex-col justify-center gap-3 p-5 sm:gap-4 sm:p-8 lg:p-11">
                <p className="flex items-center gap-2 text-sm font-semibold text-[var(--hm-accent-gold)]">
                  <CalendarDays size={16} aria-hidden="true" />
                  {formatDate(featured.publishedAt ?? featured.createdAt)}
                </p>
                <h2 className="hm-subsection-title">{featured.title}</h2>
                <p className="hm-body line-clamp-3 text-[var(--hm-subtext)]">
                  {featured.body}
                </p>
                <span className="mt-2 inline-flex items-center gap-2 text-[15px] font-bold text-[var(--hm-primary)]">
                  자세히 보기
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </article>
          </Link>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="hm-link-focus group block h-full"
              >
                <article className="hm-card-hover flex h-full items-center gap-4 overflow-hidden rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-3 sm:flex-col sm:items-stretch sm:gap-0 sm:rounded-[20px] sm:p-0">
                  <div className="hm-image-zoom relative aspect-square w-[86px] shrink-0 overflow-hidden rounded-[12px] sm:aspect-[4/2.6] sm:w-auto sm:rounded-none">
                    <Image
                      src={eventImages[(index + 1) % eventImages.length]}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 86px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 sm:flex sm:flex-1 sm:flex-col sm:gap-3 sm:p-6">
                    <p className="flex items-center gap-1.5 text-[11px] text-[var(--hm-accent-gold)] sm:gap-2 sm:text-sm">
                      <CalendarDays size={14} aria-hidden="true" />
                      {formatDate(event.publishedAt ?? event.createdAt)}
                    </p>
                    <h2 className="mt-1 truncate text-[15px] font-bold leading-snug text-[var(--hm-text)] sm:mt-0 sm:whitespace-normal sm:text-[var(--hm-type-card-title)] sm:leading-[1.38]">
                      {event.title}
                    </h2>
                    <p className="hm-caption hidden text-[var(--hm-subtext)] sm:line-clamp-3">
                      {event.body}
                    </p>
                    <span className="mt-auto hidden items-center gap-2 pt-1 text-sm font-bold text-[var(--hm-primary)] sm:inline-flex">
                      자세히 보기
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-white/30 sm:hidden" aria-hidden="true" />
                </article>
              </Link>
            ))}
          </div>
        ) : null}

        {events.length === 0 ? (
          <div className="mt-12 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center">
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              진행 중인 이벤트가 없습니다. 새로운 소식을 준비하고 있어요.
            </p>
          </div>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-[20px] border border-[var(--hm-warm-border)] bg-[radial-gradient(60%_120%_at_50%_0%,rgba(184,130,30,.1),transparent_70%),var(--hm-surface)] px-5 py-8 text-center md:mt-16 md:rounded-[24px] md:px-8 md:py-14 lg:mt-20">
          <p className="hm-eyebrow">Benefit</p>
          <h2 className="mt-3 text-[20px] font-bold leading-[1.35] text-[var(--hm-primary)] hm-serif md:mt-4 md:text-[var(--hm-type-subsection)]">방문 전, 쿠폰을 먼저 챙기세요</h2>
          <p className="hm-body mx-auto mt-2.5 max-w-md text-[var(--hm-subtext)] md:mt-4">
            발행 중인 방문 혜택을 확인하고 다운로드해 두면 매장에서 바로 사용할 수 있습니다.
          </p>
          <ButtonLink href="/coupons" className="mt-5 md:mt-8">
            쿠폰 확인하기
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </section>
      </Container>
    </main>
  );
}
