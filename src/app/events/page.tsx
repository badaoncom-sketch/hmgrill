import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { contentPostSelect, mapContentPost } from "@/lib/content/db";
import { createClient } from "@/lib/supabase/server";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("content_posts")
    .select(contentPostSelect)
    .eq("type", "event")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });
  const events = (rows ?? []).map(mapContentPost);

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="EVENT"
        title="이벤트"
        description="화목의 계절 메뉴, 매장 소식, 회원 혜택을 차분하게 전합니다."
      />
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent>
              <h2 className="text-xl font-bold text-[#17130f]">
                {event.title}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5f554a]">
                {event.body}
              </p>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm font-semibold text-[#5f554a]">
                진행 중인 이벤트가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
