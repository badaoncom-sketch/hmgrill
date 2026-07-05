import { SignupForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="hm-page-shell hm-page-shell-narrow">
      <SectionHeading
        eyebrow="JOIN"
        title="회원가입"
        description="이메일 하나로 가입하고, 쿠폰을 받을 때 필요한 정보는 최초 1회만 입력합니다."
      />
      <Card>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </main>
  );
}
