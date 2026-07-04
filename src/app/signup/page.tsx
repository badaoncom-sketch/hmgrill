import { SignupForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="mx-auto grid max-w-xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="JOIN"
        title="회원가입"
        description="가입 후 Resend 이메일 인증을 완료해야 쿠폰을 다운로드할 수 있습니다."
      />
      <Card>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
