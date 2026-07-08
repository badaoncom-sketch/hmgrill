import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, List } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
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
    .eq("type", "notice")
    .eq("id", id)
    .maybeSingle();
  return { title: data?.title ?? "공지사항" };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: allRows }] = await Promise.all([
    supabase
      .from("content_posts")
      .select(contentPostSelect)
      .eq("type", "notice")
      .eq("id", id)
      .single(),
    supabase
      .from("content_posts")
      .select("id,title,published_at,created_at")
      .eq("type", "notice")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(7),
  ]);

  if (!data) {
    notFound();
  }

  const notice = mapContentPost(data);
  // 현재 글을 제외한 최신 공지 목록
  const others = (allRows ?? []).filter((row) => row.id !== id).slice(0, 6);

  return (
    <main className="hm-page-main">
      <Container className="grid gap-6 md:gap-8">
        <ButtonLink href="/notices" variant="ghost" className="-ml-3 w-fit">
          <ArrowLeft size={16} aria-hidden="true" />
          공지사항 목록
        </ButtonLink>

        <Card>
          <CardContent className="grid gap-6 p-5 md:gap-7 md:p-8">
            <div>
              <p className="text-sm font-semibold text-[var(--hm-accent-gold)]">
                {formatDate(notice.publishedAt ?? notice.createdAt)}
              </p>
              <h1 className="hm-serif mt-3 text-2xl font-bold leading-[1.35] text-[var(--hm-primary)] md:mt-4 md:text-3xl">
                {notice.title}
              </h1>
            </div>
            <div className="whitespace-pre-line border-t border-[var(--hm-divider)] pt-6 leading-8 text-[var(--hm-subtext)] md:pt-8">
              {notice.body}
            </div>
          </CardContent>
        </Card>

        {others.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between gap-4 border-b border-[var(--hm-warm-border)] pb-4">
              <h2 className="hm-serif text-[19px] font-bold text-[var(--hm-primary)] md:text-[22px]">
                다른 공지사항
              </h2>
              <Link
                href="/notices"
                className="hm-link-focus shrink-0 text-sm font-bold text-[var(--hm-subtext)] transition hover:text-[var(--hm-primary)]"
              >
                전체 보기
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] md:mt-5 md:rounded-[20px]">
              <div className="divide-y divide-[var(--hm-divider)]">
                {others.map((row) => (
                  <Link
                    key={row.id}
                    href={`/notices/${row.id}`}
                    className="hm-link-focus group flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/[0.03] md:px-6 md:py-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-white/80 transition group-hover:text-[var(--hm-primary)] md:text-[15px]">
                        {row.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-semibold text-white/40 sm:hidden">
                        {formatDate(row.published_at ?? row.created_at)}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-sm text-[var(--hm-subtext)] sm:block">
                      {formatDate(row.published_at ?? row.created_at)}
                    </span>
                    <ChevronRight size={15} className="shrink-0 text-white/30" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex justify-center">
          <ButtonLink href="/notices" variant="outline" className="min-w-[220px]">
            <List size={16} aria-hidden="true" />
            목록으로 돌아가기
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
