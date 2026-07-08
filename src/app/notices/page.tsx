import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { LiveSearchInput } from "@/components/live-search-input";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "공지사항",
  description: "영업 안내, 이용 공지, 방문 전 확인할 정보를 정리합니다.",
};

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  let request = supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "notice");
  if (query) {
    const escaped = query.replace(/[\\%_]/g, (ch) => `\\${ch}`);
    request = request.ilike("title", `%${escaped}%`);
  }
  const { data: rows } = await request
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  const notices = (rows ?? []).map(mapContentPost);

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">Notice</p>
            <h1 className="hm-section-title mt-5">공지사항</h1>
            <p className="hm-body mt-5 text-[var(--hm-subtext)]">
              영업 안내, 이용 공지, 방문 전 확인할 정보를 정리합니다.
            </p>
          </div>

          <Suspense fallback={null}>
            <LiveSearchInput placeholder="제목 검색" className="w-full shrink-0 lg:w-[300px]" />
          </Suspense>
        </div>

        {query ? (
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[var(--hm-subtext)]">
            <span>
              &lsquo;<span className="font-bold text-[var(--hm-primary)]">{query}</span>&rsquo; 검색
              결과 {notices.length}건
            </span>
            <Link
              href="/notices"
              className="hm-link-focus inline-flex items-center gap-1.5 rounded-full border border-[var(--hm-border)] px-3 py-1 text-xs font-bold transition hover:text-[var(--hm-primary)]"
            >
              <RotateCcw size={12} aria-hidden="true" />
              전체 보기
            </Link>
          </div>
        ) : null}

        {notices.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] lg:mt-10">
            <div className="divide-y divide-[var(--hm-divider)]">
              {notices.map((notice, index) => (
                <Link
                  key={notice.id}
                  href={`/notices/${notice.id}`}
                  className="hm-link-focus group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03] sm:px-6"
                >
                  <span className="hidden w-9 shrink-0 text-center font-mono text-xs text-white/35 sm:block">
                    {notices.length - index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-white/85 transition group-hover:text-[var(--hm-primary)]">
                      {notice.title}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-white/40 sm:hidden">
                      {formatDate(notice.publishedAt ?? notice.createdAt)}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-sm text-[var(--hm-subtext)] sm:block">
                    {formatDate(notice.publishedAt ?? notice.createdAt)}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-white/30" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-8 py-16 text-center lg:mt-10">
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              {query
                ? "검색 결과가 없습니다. 다른 검색어로 시도해 보세요."
                : "등록된 공지사항이 없습니다."}
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
