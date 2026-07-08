import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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
      .select("id,title")
      .eq("type", "notice")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false }),
  ]);

  if (!data) {
    notFound();
  }

  const notice = mapContentPost(data);
  const list = allRows ?? [];
  const currentIndex = list.findIndex((row) => row.id === id);
  // 목록과 같은 정렬 기준: 이전 글 = 목록에서 위(더 최신), 다음 글 = 아래.
  const previous = currentIndex > 0 ? list[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < list.length - 1
      ? list[currentIndex + 1]
      : null;

  return (
    <main className="hm-page-main">
      <Container className="grid gap-8">
        <ButtonLink href="/notices" variant="ghost" className="-ml-3 w-fit">
          <ArrowLeft size={16} aria-hidden="true" />
          목록으로
        </ButtonLink>
        <Card>
          <CardContent className="grid gap-7 p-8">
            <div>
              <p className="text-sm font-semibold text-[var(--hm-accent-gold)]">
                {formatDate(notice.publishedAt ?? notice.createdAt)}
              </p>
              <h1 className="hm-serif mt-4 text-3xl font-bold leading-[1.35] text-[var(--hm-primary)]">
                {notice.title}
              </h1>
            </div>
            <div className="whitespace-pre-line border-y border-[var(--hm-divider)] py-8 leading-8 text-[var(--hm-subtext)]">
              {notice.body}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={`/notices/${previous.id}`}
                  className="hm-link-focus group rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 transition hover:border-[rgba(247,230,193,.28)]"
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white/40">
                    <ChevronLeft size={13} aria-hidden="true" />
                    이전 글
                  </span>
                  <span className="mt-2 block truncate text-sm font-bold text-white/80 transition group-hover:text-[var(--hm-primary)]">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <div className="rounded-[16px] border border-[var(--hm-border)] bg-black/15 p-4">
                  <span className="text-xs font-bold text-white/25">이전 글</span>
                  <span className="mt-2 block text-sm font-semibold text-white/25">
                    이전 글이 없습니다
                  </span>
                </div>
              )}
              {next ? (
                <Link
                  href={`/notices/${next.id}`}
                  className="hm-link-focus group rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-right transition hover:border-[rgba(247,230,193,.28)]"
                >
                  <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-white/40">
                    다음 글
                    <ChevronRight size={13} aria-hidden="true" />
                  </span>
                  <span className="mt-2 block truncate text-sm font-bold text-white/80 transition group-hover:text-[var(--hm-primary)]">
                    {next.title}
                  </span>
                </Link>
              ) : (
                <div className="rounded-[16px] border border-[var(--hm-border)] bg-black/15 p-4 text-right">
                  <span className="text-xs font-bold text-white/25">다음 글</span>
                  <span className="mt-2 block text-sm font-semibold text-white/25">
                    다음 글이 없습니다
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
