import Link from "next/link";
import { LoginForm, ResendVerificationForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto grid max-w-xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="MEMBER"
        title="로그인"
        description="회원 인증 후 방문 혜택과 마이페이지를 이용할 수 있습니다."
      />
      <Card>
        <CardContent>
          <LoginForm />
          <div className="mt-4 flex justify-between text-sm text-[#5f554a]">
            <Link href="/signup" className="hm-link-focus rounded-sm hover:text-[#17130f]">
              회원가입
            </Link>
            <Link href="/mypage" className="hm-link-focus rounded-sm hover:text-[#17130f]">
              마이페이지
            </Link>
          </div>
          <div className="mt-6 border-t border-[#17130f14] pt-6">
            <ResendVerificationForm />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
