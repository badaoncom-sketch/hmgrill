import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
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
          <h1 className="hm-section-title mt-5">이벤트</h1>
          <p className="hm-body mt-5 text-[var(--hm-subtext)]">
            화목의 계절 메뉴, 매장 소식, 회원 혜택을 차분하게 전합니다.
          </p>
        </div>

        {featured ? (
          <Link
            href={`/events/${featured.id}`}
            className="hm-link-focus group mt-12 block"
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
              <div className="flex flex-col justify-center gap-4 p-8 lg:p-11">
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
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="hm-link-focus group block h-full"
              >
                <article className="hm-card-hover flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)]">
                  <div className="hm-image-zoom relative aspect-[4/2.6] overflow-hidden">
                    <Image
                      src={eventImages[(index + 1) % eventImages.length]}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="flex items-center gap-2 text-sm text-[var(--hm-accent-gold)]">
                      <CalendarDays size={16} aria-hidden="true" />
                      {formatDate(event.publishedAt ?? event.createdAt)}
                    </p>
                    <h2 className="hm-card-title">{event.title}</h2>
                    <p className="hm-caption line-clamp-3 text-[var(--hm-subtext)]">
                      {event.body}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-1 text-sm font-bold text-[var(--hm-primary)]">
                      자세히 보기
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
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

        <section className="mt-16 overflow-hidden rounded-[24px] border border-[var(--hm-warm-border)] bg-[radial-gradient(60%_120%_at_50%_0%,rgba(184,130,30,.1),transparent_70%),var(--hm-surface)] px-8 py-14 text-center lg:mt-20">
          <p className="hm-eyebrow">Benefit</p>
          <h2 className="hm-subsection-title mt-4">방문 전, 쿠폰을 먼저 챙기세요</h2>
          <p className="hm-body mx-auto mt-4 max-w-md text-[var(--hm-subtext)]">
            발행 중인 방문 혜택을 확인하고 다운로드해 두면 매장에서 바로 사용할 수 있습니다.
          </p>
          <ButtonLink href="/coupons" className="mt-8">
            쿠폰 확인하기
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
        </section>
      </Container>
    </main>
  );
}
