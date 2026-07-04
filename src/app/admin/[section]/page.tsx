import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const sections: Record<string, string> = {
  members: "회원관리",
  staff: "직원관리",
  menu: "메뉴관리",
  events: "이벤트관리",
  notices: "공지사항관리",
  inquiries: "문의관리",
  banners: "배너관리",
  popups: "팝업관리",
};

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = sections[section];

  if (!title) {
    notFound();
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="ADMIN"
        title={title}
        description="관리자 권한과 데이터 모델 연결 후 실제 운영 화면으로 확장합니다."
      />
      <Card>
        <CardContent>
          <p className="text-sm leading-6 text-neutral-600">
            현재 1차 구현에서는 관리자 메뉴 라우트와 접근 구조를 먼저
            구성했습니다. 이후 Supabase 테이블, RLS, 서버 액션 연결 단계에서
            실제 목록과 편집 기능을 구현합니다.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
