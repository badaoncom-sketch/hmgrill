import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Bell, Ticket } from "lucide-react";
import { updateMarketingConsentAction } from "@/app/actions/profile";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "회원 인증 상태와 화목 방문 혜택을 확인합니다.",
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "member_uid,name,phone,address,email,email_verified,role,privacy_accepted_at,profile_completed_at,marketing_accepted_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.email_verified) {
    redirect("/login");
  }

  const [{ count: availableCount }, { count: unreadNotifications }] = await Promise.all([
    supabase
      .from("member_coupons")
      .select("id", { count: "exact", head: true })
      .eq("member_id", user.id)
      .eq("status", "available"),
    supabase
      .from("member_notifications")
      .select("id", { count: "exact", head: true })
      .eq("member_id", user.id)
      .is("read_at", null)
      .is("archived_at", null)
      .is("deleted_at", null),
  ]);

  const profileRows = [
    { label: "회원 UID", value: profile.member_uid },
    { label: "이름", value: profile.name || "미입력" },
    { label: "연락처", value: profile.phone || "미입력" },
    { label: "주소", value: profile.address || "미입력" },
    {
      label: "개인정보 동의일",
      value: profile.privacy_accepted_at
        ? new Date(profile.privacy_accepted_at).toLocaleString("ko-KR")
        : "아직 동의하지 않았습니다",
    },
    {
      label: "이벤트·혜택 수신 (선택)",
      value: profile.marketing_accepted_at
        ? `동의 (${new Date(profile.marketing_accepted_at).toLocaleDateString("ko-KR")})`
        : "미동의",
    },
  ];

  return (
    <main className="hm-page-main">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="hm-eyebrow">My Page</p>
            <h1 className="hm-section-title mt-3 md:mt-5">마이페이지</h1>
            <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-5">
              회원 인증 상태와 화목 방문 혜택을 확인합니다.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ButtonLink href="/notifications" variant="outline" className="relative">
              <Bell size={16} aria-hidden="true" />
              알림센터
              {(unreadNotifications ?? 0) > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--hm-accent-red)] px-1.5 text-[11px] font-bold leading-none text-white">
                  {(unreadNotifications ?? 0) > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </ButtonLink>
            {profile.role === "admin" ? (
              <ButtonLink href="/admin" variant="outline">
                관리자 콘솔
              </ButtonLink>
            ) : null}
            {profile.role === "staff" || profile.role === "admin" ? (
              <ButtonLink href="/qr-coupon" variant="outline">
                QR 쿠폰 스캔
              </ButtonLink>
            ) : null}
          </div>
        </div>

        <section className="mt-7 grid gap-4 md:mt-12 md:gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="relative overflow-hidden rounded-[20px] border border-[rgba(247,230,193,.16)] bg-[linear-gradient(135deg,#1a1510,#0d0c0a_52%,#161009)] p-5 shadow-[var(--hm-shadow-strong)] md:rounded-[24px] md:p-8 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_85%_0%,rgba(184,130,30,.14),transparent_70%)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 top-1/2 h-52 w-52 -translate-y-1/2 opacity-[0.07]"
            >
              <Image
                src="/images/brand/brand-logo-transparent.png"
                alt=""
                fill
                sizes="208px"
                className="object-contain"
              />
            </span>

            <div className="relative">
              <p className="hm-eyebrow">Hwamok Member</p>
              <p className="hm-serif mt-3 text-[22px] font-bold leading-[1.3] text-[var(--hm-primary)] md:mt-5 md:text-[clamp(26px,2.4vw,32px)]">
                {profile.name || "화목 회원"} 님
              </p>
              <Badge tone="green" className="mt-3 md:mt-4">
                이메일 인증 완료
              </Badge>

              <div className="mt-6 md:mt-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/36">
                  Member UID
                </p>
                <p className="mt-1.5 font-mono text-[19px] font-semibold tracking-[0.18em] text-white md:mt-2 md:text-[24px]">
                  {profile.member_uid}
                </p>
              </div>
              <p className="mt-2 text-[13px] font-medium text-white/45 md:mt-3 md:text-sm">{profile.email}</p>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-[18px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-5 md:rounded-[20px] md:p-7 lg:p-8">
            <div>
              <div className="flex items-start justify-between gap-4">
                <p className="hm-eyebrow">Coupon</p>
                <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-[rgba(247,230,193,.18)] text-[var(--hm-accent-gold)]">
                  <Ticket size={20} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[var(--hm-subtext)] md:mt-4">
                사용 가능한 쿠폰
              </p>
              <p className="mt-2 text-[34px] font-bold leading-none text-[var(--hm-primary)] md:mt-3 md:text-[46px]">
                {availableCount ?? 0}
                <span className="ml-1.5 text-[15px] font-semibold text-white/50 md:text-[18px]">장</span>
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-8 md:flex md:flex-wrap md:gap-3">
              <ButtonLink href="/coupons/my">내 쿠폰 보기</ButtonLink>
              <ButtonLink href="/coupons/history" variant="outline">
                사용내역
              </ButtonLink>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 border-t border-[var(--hm-warm-border)] pt-8 md:mt-14 md:gap-10 md:pt-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="hm-eyebrow">Profile</p>
            <h2 className="hm-subsection-title mt-3 md:mt-4">개인정보 확인</h2>
            <p className="hm-body mt-3 text-[var(--hm-subtext)] md:mt-4">
              쿠폰 발급 및 사용 확인을 위해 최초 1회 입력한 정보입니다.
            </p>
            <div className="mt-5">
              {profile.profile_completed_at ? (
                <Badge tone="green">입력 완료</Badge>
              ) : (
                <Badge tone="amber">입력 필요</Badge>
              )}
            </div>
            {!profile.profile_completed_at ? (
              <ButtonLink href="/coupons" variant="outline" className="mt-6">
                쿠폰 수령 정보 입력하기
              </ButtonLink>
            ) : null}
          </div>

          <div className="self-start">
            <dl className="border-t border-[var(--hm-border)]">
              {profileRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 border-b border-[var(--hm-border)] py-4"
                >
                  <dt className="shrink-0 text-sm font-bold text-[var(--hm-text)]">
                    {row.label}
                  </dt>
                  <dd className="text-right text-sm text-[var(--hm-subtext)]">{row.value}</dd>
                </div>
              ))}
            </dl>
            {profile.marketing_accepted_at ? (
              <form
                action={updateMarketingConsentAction}
                className="mt-3 flex items-center justify-end gap-2 text-[11px] text-white/28"
              >
                <input name="consent" type="hidden" value="0" />
                <span>이벤트·혜택 소식 수신 중</span>
                <span aria-hidden="true">·</span>
                <button
                  type="submit"
                  className="hm-link-focus rounded-sm underline underline-offset-2 transition hover:text-white/55"
                >
                  수신 철회
                </button>
              </form>
            ) : (
              <form
                action={updateMarketingConsentAction}
                className="mt-4 flex items-center justify-between gap-4 rounded-[14px] border border-[var(--hm-border)] bg-black/20 p-4"
              >
                <input name="consent" type="hidden" value="1" />
                <p className="text-xs leading-5 text-[var(--hm-subtext)]">
                  (선택) 이벤트·혜택 소식을 이메일, 문자(SMS), DM으로 받아볼 수 있습니다.
                </p>
                <Button type="submit" variant="outline" className="min-h-9 shrink-0 px-3.5 text-xs">
                  수신 동의하기
                </Button>
              </form>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
