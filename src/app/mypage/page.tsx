import { MailCheck, Ticket } from "lucide-react";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("name,email,email_verified,role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  if (!profile?.email_verified) {
    redirect("/login");
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="MY PAGE"
        title="마이페이지"
        description="회원 인증 상태와 화목 방문 혜택을 확인합니다."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent>
            <MailCheck className="text-emerald-700" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-[#17130f]">
              이메일 인증 상태
            </h2>
            <Badge tone="green" className="mt-3">
              인증 완료
            </Badge>
            <p className="mt-3 text-sm text-[#5f554a]">
              {profile.name} / {profile.email}
            </p>
            <form action={logoutAction} className="mt-5">
              <Button type="submit" variant="outline">
                로그아웃
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Ticket className="text-[#B13A1E]" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-[#17130f]">
              내 쿠폰 관리
            </h2>
            <p className="mt-3 text-sm text-[#5f554a]">
              다운로드한 쿠폰과 사용내역을 확인할 수 있습니다.
            </p>
            <ButtonLink href="/coupons/my" className="mt-5">
              내 쿠폰 보기
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
