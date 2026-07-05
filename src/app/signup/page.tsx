import { SignupForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="mx-auto grid max-w-xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="JOIN"
        title="회원가입"
        description="이메일 인증을 완료하면 화목 회원 혜택과 쿠폰 기능을 이용할 수 있습니다."
      />
      <Card>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
