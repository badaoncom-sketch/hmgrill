import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Gift } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

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

  return (
    <main className="py-[120px]">
      <Container className="grid gap-8">
        <ButtonLink href="/events" variant="ghost" className="w-fit px-0">
          <ArrowLeft size={16} aria-hidden="true" />
          이벤트 목록
        </ButtonLink>
        <section className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-[var(--hm-border)]">
            <Image
              src="/images/brand/brand-fire-wall.png"
              alt={event.title}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
          <Card>
            <CardContent className="grid gap-6">
              <p className="text-sm text-[var(--hm-accent-gold)]">
                {formatDate(event.publishedAt ?? event.createdAt)}
              </p>
              <h1 className="hm-serif text-3xl font-bold text-[var(--hm-primary)] sm:text-4xl">
                {event.title}
              </h1>
              <p className="whitespace-pre-line leading-8 text-[var(--hm-subtext)]">
                {event.body}
              </p>
              <div className="rounded-[20px] border border-[rgba(247,230,193,.2)] bg-[var(--hm-surface)] p-5">
                <Gift className="text-[var(--hm-accent-gold)]" size={28} aria-hidden="true" />
                <h2 className="mt-3 font-bold text-[var(--hm-primary)]">쿠폰 안내</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--hm-subtext)]">
                  사용 가능한 혜택은 쿠폰 페이지에서 확인할 수 있습니다.
                </p>
              </div>
              <ButtonLink href="/coupons">쿠폰 받기</ButtonLink>
            </CardContent>
          </Card>
        </section>
      </Container>
    </main>
  );
}
