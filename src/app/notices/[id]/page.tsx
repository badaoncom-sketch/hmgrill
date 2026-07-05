import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "notice")
    .eq("id", id)
    .single();

  if (!data) {
    notFound();
  }

  const notice = mapContentPost(data);

  return (
    <main className="py-[120px]">
      <Container className="grid gap-8">
        <ButtonLink href="/notices" variant="ghost" className="w-fit px-0">
          <ArrowLeft size={16} aria-hidden="true" />
          목록으로
        </ButtonLink>
        <Card>
          <CardContent className="grid gap-7 p-8">
            <div>
              <p className="text-sm text-[var(--hm-accent-gold)]">
                {formatDate(notice.publishedAt ?? notice.createdAt)}
              </p>
              <h1 className="hm-serif mt-4 text-3xl font-bold text-[var(--hm-primary)]">
                {notice.title}
              </h1>
            </div>
            <div className="whitespace-pre-line border-y border-[var(--hm-divider)] py-8 leading-8 text-[var(--hm-subtext)]">
              {notice.body}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm text-[var(--hm-subtext)]">
                이전글은 운영 데이터 확정 후 연결됩니다.
              </div>
              <div className="rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm text-[var(--hm-subtext)]">
                다음글은 운영 데이터 확정 후 연결됩니다.
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
