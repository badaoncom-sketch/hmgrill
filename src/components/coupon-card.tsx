import { CalendarDays, ChevronDown, Ticket } from "lucide-react";
import { CouponDownloadForm } from "@/components/coupon-download-form";
import { Badge } from "@/components/ui/badge";
import { canDownloadCoupon, getRemainingQuantity } from "@/lib/coupon-policy";
import type { CouponIssue } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CouponCard({
  issue,
  memberCoupons = [],
  profileRequired = false,
  marketingConsented = false,
  profile,
}: {
  issue: CouponIssue;
  memberCoupons?: Parameters<typeof canDownloadCoupon>[1];
  profileRequired?: boolean;
  marketingConsented?: boolean;
  profile?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}) {
  const decision = canDownloadCoupon(issue, memberCoupons);
  const remaining = getRemainingQuantity(issue);
  const remainingPct = issue.quantity > 0 ? Math.max(0, Math.min(100, (remaining / issue.quantity) * 100)) : 0;
  const issuing = issue.status === "issuing";

  return (
    <article
      className={`overflow-hidden rounded-[24px] border bg-[var(--hm-surface)] ${
        issuing
          ? "border-[rgba(247,230,193,.24)] shadow-[var(--hm-shadow)]"
          : "border-[var(--hm-border)] opacity-75"
      }`}
    >
      <div className="grid md:grid-cols-[minmax(0,1fr)_235px]">
        <div className="p-4 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={issuing ? "green" : "neutral"}>
                {issuing ? "발행중" : "발행종료"}
              </Badge>
              {issuing && remaining <= Math.max(5, Math.ceil(issue.quantity * 0.1)) ? (
                <Badge tone="red">마감 임박</Badge>
              ) : null}
            </div>
            <p className="shrink-0 text-[20px] font-bold leading-none text-[var(--hm-primary)] md:hidden">
              {formatCurrency(issue.amount)}
            </p>
          </div>
          <h2 className="mt-3 text-[17px] font-bold leading-snug text-[var(--hm-text)] sm:mt-4 sm:text-[21px]">
            {issue.name}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-[13px] font-semibold text-[var(--hm-subtext)] sm:mt-3 sm:text-sm">
            <CalendarDays size={15} className="text-[var(--hm-accent-gold)]" aria-hidden="true" />
            다운로드 후 {issue.validityDays}일 사용 가능
          </p>
          <div className="mt-3 md:hidden">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${issuing ? "bg-[var(--hm-primary)]/80" : "bg-white/20"}`}
                style={{ width: `${remainingPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-white/45">
              남은 수량 {remaining}장 / 총 {issue.quantity}장
            </p>
          </div>
          {issue.conditionText ? (
            <>
              <details className="group mt-3 rounded-[14px] border border-[var(--hm-border)] bg-black/20 md:hidden">
                <summary className="hm-link-focus flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-[13px] font-bold text-[var(--hm-subtext)] [&::-webkit-details-marker]:hidden">
                  사용조건 보기
                  <ChevronDown size={14} className="transition group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="whitespace-pre-line border-t border-[var(--hm-border)] px-4 py-3 text-[13px] leading-6 text-[var(--hm-subtext)]">
                  {issue.conditionText}
                </p>
              </details>
              <p className="mt-4 hidden whitespace-pre-line rounded-[14px] border border-[var(--hm-border)] bg-black/20 p-4 text-[13px] leading-6 text-[var(--hm-subtext)] md:block">
                {issue.conditionText}
              </p>
            </>
          ) : null}
          <div className="mt-4 sm:mt-5">
            <CouponDownloadForm
              issueId={issue.id}
              disabled={!decision.allowed}
              profileRequired={profileRequired}
              marketingConsented={marketingConsented}
              profile={profile}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--hm-subtext)]">{decision.reason}</p>
          </div>
        </div>

        <div className="relative hidden content-center gap-5 border-t border-dashed border-white/[0.14] p-6 text-center md:grid md:border-l md:border-t-0">
          <span
            aria-hidden="true"
            className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-[var(--hm-background)] md:block"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-[var(--hm-background)] md:block"
          />

          <div>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-[14px] border border-[rgba(247,230,193,.22)] text-[var(--hm-accent-gold)]">
              <Ticket size={20} aria-hidden="true" />
            </span>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/36">
              Discount
            </p>
            <p className="mt-1.5 text-[30px] font-bold leading-none text-[var(--hm-primary)]">
              {formatCurrency(issue.amount)}
            </p>
          </div>

          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${issuing ? "bg-[var(--hm-primary)]/80" : "bg-white/20"}`}
                style={{ width: `${remainingPct}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold text-white/45">
              남은 수량 {remaining}장 / 총 {issue.quantity}장
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
