import Link from "next/link";
import { Search } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/layout";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
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
    <main className="hm-page-main">
      <Container className="grid gap-8">
        <SectionHeading
          eyebrow="NOTICE"
          title="공지사항"
          description="영업 안내, 이용 공지, 방문 전 확인할 정보를 정리합니다."
        />
        <Card>
          <CardContent className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Badge tone="amber">전체</Badge>
                <Badge>영업 안내</Badge>
                <Badge>이용 안내</Badge>
              </div>
              <div className="flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 text-sm text-[var(--hm-subtext)]">
                <Search size={16} aria-hidden="true" />
                검색어를 입력하세요
              </div>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-24">번호</TableHeaderCell>
                  <TableHeaderCell>제목</TableHeaderCell>
                  <TableHeaderCell className="w-44">등록일</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {notices.map((notice, index) => (
                  <TableRow key={notice.id}>
                    <TableCell>{notices.length - index}</TableCell>
                    <TableCell>
                      <Link href={`/notices/${notice.id}`} className="hm-link-focus font-semibold text-[var(--hm-text)] hover:text-[var(--hm-primary)]">
                        {notice.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(notice.publishedAt ?? notice.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            {notices.length === 0 ? (
              <p className="text-sm font-semibold text-[var(--hm-subtext)]">
                등록된 공지사항이 없습니다.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
