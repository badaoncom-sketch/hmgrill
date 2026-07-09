import type { Metadata } from "next";
import { Gift, TicketX } from "lucide-react";
import { GuestClaimButton } from "@/components/guest-claim-button";
import { Container } from "@/components/ui/layout";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "감사쿠폰 받기",
  robots: { index: false, follow: false },
};

export default async function GuestClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: claim } = await admin
    .from("guest_claim_tokens")
    .select("token,expires_at,claimed_at,coupon_issues(name,amount,validity_days,condition_text)")
    .eq("token", token)
    .maybeSingle();

  const issue = Array.isArray(claim?.coupon_issues)
    ? claim?.coupon_issues[0]
    : claim?.coupon_issues;
  const invalidReason = !claim
    ? "유효하지 않은 발급 코드입니다."
    : claim.claimed_at
      ? "이미 사용된 발급 QR입니다."
      : new Date(claim.expires_at) < new Date()
        ? "발급 QR이 만료되었습니다."
        : null;

  return (
    <main className="hm-page-main">
      <Container>
        <div className="mx-auto max-w-md py-6 text-center md:py-16">
          {invalidReason ? (
            <>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[var(--hm-border)] text-white/40">
                <TicketX size={28} aria-hidden="true" />
              </span>
              <h1 className="hm-subsection-title mt-6">{invalidReason}</h1>
              <p className="hm-body mt-3 text-[var(--hm-subtext)]">
                계산대 직원에게 새 발급 QR을 요청해 주세요.
              </p>
            </>
          ) : (
            <>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[rgba(247,230,193,.3)] text-[var(--hm-accent-gold)]">
                <Gift size={28} aria-hidden="true" />
              </span>
              <p className="hm-eyebrow mt-6">Thank You Coupon</p>
              <h1 className="hm-subsection-title mt-3">
                방문해 주셔서 감사합니다
              </h1>
              <div className="mt-6 rounded-[20px] border border-[rgba(247,230,193,.24)] bg-[linear-gradient(150deg,#211a11,#0f0d0a_60%)] p-6">
                <p className="text-sm font-bold text-white/80">{issue?.name}</p>
                <p className="hm-serif mt-2 text-[38px] font-bold leading-none text-[var(--hm-primary)]">
                  {formatCurrency(issue?.amount ?? 0)}
                </p>
                <p className="mt-3 text-xs font-semibold text-white/50">
                  받은 날부터 {issue?.validity_days}일 안에 사용할 수 있어요
                </p>
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--hm-subtext)]">
                가입이나 정보 입력 없이 바로 받을 수 있습니다.
              </p>
              <GuestClaimButton claimToken={token} />
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
