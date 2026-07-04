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
        description="이메일 인증 완료 회원만 쿠폰 다운로드와 마이페이지 접근이 가능합니다."
      />
      <Card>
        <CardContent>
          <LoginForm />
          <div className="mt-4 flex justify-between text-sm text-neutral-600">
            <Link href="/signup" className="hover:text-neutral-950">
              회원가입
            </Link>
            <Link href="/mypage" className="hover:text-neutral-950">
              마이페이지
            </Link>
          </div>
          <div className="mt-6 border-t border-neutral-100 pt-6">
            <ResendVerificationForm />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
