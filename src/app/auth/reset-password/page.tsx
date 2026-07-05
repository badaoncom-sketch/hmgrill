import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/auth-forms";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/password-reset");
  }

  return (
    <main className="mx-auto grid max-w-xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="PASSWORD"
        title="새 비밀번호 설정"
        description="앞으로 로그인할 새 비밀번호를 입력해 주세요."
      />
      <Card>
        <CardContent>
          <UpdatePasswordForm />
          <ButtonLink href="/login" variant="ghost" className="mt-4 px-0">
            로그인으로 이동
          </ButtonLink>
        </CardContent>
      </Card>
    </main>
  );
}
