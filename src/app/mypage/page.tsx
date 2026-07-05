import { MailCheck, ShieldCheck, Ticket } from "lucide-react";
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
        .select("name,phone,address,email,email_verified,role,privacy_accepted_at,profile_completed_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  if (!profile?.email_verified) {
    redirect("/login");
  }

  return (
    <main className="hm-page-shell">
      <SectionHeading
        eyebrow="MY PAGE"
        title="마이페이지"
        description="회원 인증 상태와 화목 방문 혜택을 확인합니다."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardContent>
            <MailCheck className="text-emerald-700" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-[var(--hm-text)]">
              이메일 인증 상태
            </h2>
            <Badge tone="green" className="mt-3">
              인증 완료
            </Badge>
            <p className="mt-3 text-sm text-[var(--hm-subtext)]">
              {profile.email}
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
            <Ticket className="text-[var(--hm-accent-gold)]" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-[var(--hm-text)]">
              내 쿠폰 관리
            </h2>
            <p className="mt-3 text-sm text-[var(--hm-subtext)]">
              다운로드한 쿠폰과 사용내역을 확인할 수 있습니다.
            </p>
            <ButtonLink href="/coupons/my" className="mt-5">
              내 쿠폰 보기
            </ButtonLink>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent>
            <ShieldCheck className="text-[var(--hm-accent-gold)]" size={30} aria-hidden="true" />
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--hm-text)]">
                  개인정보 확인
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--hm-subtext)]">
                  쿠폰 발급 및 사용 확인을 위해 최초 1회 입력한 정보입니다.
                </p>
              </div>
              {profile.profile_completed_at ? (
                <Badge tone="green">입력 완료</Badge>
              ) : (
                <Badge tone="amber">입력 필요</Badge>
              )}
            </div>
            <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
              <InfoItem label="이름" value={profile.name} />
              <InfoItem label="연락처" value={profile.phone} />
              <InfoItem label="주소" value={profile.address} />
            </div>
            <div className="mt-5 rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm leading-6 text-[var(--hm-subtext)]">
              개인정보처리 안내 동의일:{" "}
              {profile.privacy_accepted_at
                ? new Date(profile.privacy_accepted_at).toLocaleString("ko-KR")
                : "아직 동의하지 않았습니다."}
            </div>
            {!profile.profile_completed_at ? (
              <ButtonLink href="/coupons" className="mt-5" variant="outline">
                쿠폰 수령 정보 입력하기
              </ButtonLink>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4">
      <p className="text-xs font-semibold text-[var(--hm-accent-gold)]">{label}</p>
      <p className="mt-2 text-[var(--hm-text)]">{value || "미입력"}</p>
    </div>
  );
}
