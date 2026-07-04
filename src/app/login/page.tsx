import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

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
          <form className="grid gap-4">
            <Field label="이메일">
              <Input name="email" type="email" placeholder="member@example.com" required />
            </Field>
            <Field label="비밀번호">
              <Input name="password" type="password" required />
            </Field>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm text-neutral-600">
            <Link href="/signup" className="hover:text-neutral-950">
              회원가입
            </Link>
            <Link href="/mypage" className="hover:text-neutral-950">
              마이페이지
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
