import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { notices } from "@/lib/site-data";
import { formatDate } from "@/lib/utils";

export default function NoticesPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="NOTICE"
        title="공지사항"
        description="매장 운영과 쿠폰 사용에 필요한 공지를 제공합니다."
      />
      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardContent>
              <p className="text-sm text-neutral-500">{formatDate(notice.date)}</p>
              <h2 className="mt-2 text-xl font-bold text-neutral-950">
                {notice.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {notice.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
