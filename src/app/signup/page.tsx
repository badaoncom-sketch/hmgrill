import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

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
          <form className="grid gap-4">
            <Field label="이름">
              <Input name="name" placeholder="홍길동" required />
            </Field>
            <Field label="휴대폰번호">
              <Input name="phone" placeholder="010-0000-0000" required />
            </Field>
            <Field label="이메일">
              <Input name="email" type="email" placeholder="member@example.com" required />
            </Field>
            <Field label="비밀번호">
              <Input name="password" type="password" required />
            </Field>
            <Button type="submit" className="w-full">
              회원가입
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
