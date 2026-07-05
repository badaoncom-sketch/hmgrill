import { PasswordResetRequestForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function PasswordResetRequestPage() {
  return (
    <main className="hm-page-shell hm-page-shell-narrow">
      <SectionHeading
        eyebrow="PASSWORD"
        title="비밀번호 찾기"
        description="가입한 이메일로 비밀번호 재설정 링크를 보내드립니다."
      />
      <Card>
        <CardContent>
          <PasswordResetRequestForm />
        </CardContent>
      </Card>
    </main>
  );
}
