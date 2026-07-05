import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function NoticesPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "notice")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  const notices = (rows ?? []).map(mapContentPost);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="NOTICE"
        title="공지사항"
        description="영업 안내, 이용 공지, 방문 전 확인할 정보를 정리합니다."
      />
      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardContent>
              <p className="text-sm text-[var(--hm-subtext)]">
                {formatDate(notice.publishedAt ?? notice.createdAt)}
              </p>
              <h2 className="mt-2 text-xl font-bold text-[var(--hm-text)]">
                {notice.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--hm-subtext)]">
                {notice.body}
              </p>
            </CardContent>
          </Card>
        ))}
        {notices.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                등록된 공지사항이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
