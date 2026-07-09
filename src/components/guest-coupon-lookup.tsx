"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Search, TicketCheck } from "lucide-react";
import {
  lookupGuestCouponStatusAction,
  type GuestCouponStatusState,
} from "@/app/actions/guest-coupons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

const initialState: GuestCouponStatusState = { ok: false, message: "" };

// 결과가 떠 있는 동안 이 주기로 상태를 다시 조회한다 (계산대 사용 처리 실시간 반영).
const LIVE_REFRESH_MS = 15_000;

export function GuestCouponLookup() {
  const [state, formAction, isPending] = useActionState(
    lookupGuestCouponStatusAction,
    initialState,
  );
  const [number, setNumber] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // 실시간 갱신: 조회 결과가 표시된 상태면 주기적으로 같은 번호를 다시 조회한다.
  useEffect(() => {
    if (!state.ok || !state.result) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        formRef.current?.requestSubmit();
      }
    }, LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [state]);

  const result = state.ok ? state.result : undefined;

  return (
    <section className="rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border border-[rgba(247,230,193,.24)] text-[var(--hm-accent-gold)]">
          <TicketCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[16px] font-bold text-[var(--hm-primary)]">
            감사쿠폰 상태 조회
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--hm-subtext)]">
            매장에서 받은 감사쿠폰의 사용 가능 여부를 쿠폰번호 8자리로
            확인할 수 있습니다. 가입이 필요 없어요.
          </p>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="mt-4 flex gap-2">
        <input
          name="couponNumber"
          value={number}
          onChange={(event) =>
            setNumber(event.target.value.replace(/\D/g, "").slice(0, 8))
          }
          inputMode="numeric"
          placeholder="쿠폰번호 8자리"
          required
          minLength={8}
          className="min-h-11 min-w-0 flex-1 rounded-[12px] border border-[var(--hm-border)] bg-black/20 px-4 font-mono text-[15px] tracking-[0.2em] text-[var(--hm-text)] outline-none transition placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-[var(--hm-subtext)] focus:border-[var(--hm-primary)]"
        />
        <Button type="submit" disabled={isPending || number.length !== 8} className="shrink-0">
          <Search size={15} aria-hidden="true" />
          {isPending ? "조회 중" : "조회"}
        </Button>
      </form>

      {!state.ok && state.message ? (
        <p className="mt-3 text-xs font-semibold text-[#f0a39b]" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-[16px] border border-[rgba(247,230,193,.18)] bg-black/25 p-4" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Badge tone={result.statusTone}>{result.statusLabel}</Badge>
              <p className="mt-2 truncate text-[15px] font-bold text-white">
                {result.couponName}
              </p>
            </div>
            <p className="shrink-0 text-[20px] font-bold leading-none text-[var(--hm-primary)]">
              {formatCurrency(result.amount)}
            </p>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-white/50">
            {result.statusLabel === "사용 완료" && result.usedAt ? (
              <span>사용일시 {new Date(result.usedAt).toLocaleString("ko-KR")}</span>
            ) : (
              <span>유효기간 {formatDate(result.validUntil)}까지</span>
            )}
            <span className="text-white/35">
              {new Date(result.checkedAt).toLocaleTimeString("ko-KR")} 기준 · 자동 갱신 중
            </span>
          </div>
          {result.statusLabel === "사용 가능" ? (
            <p className="mt-3 text-xs leading-5 text-[var(--hm-subtext)]">
              QR은 쿠폰을 받을 때 저장한 링크·이미지에서 확인할 수 있으며,
              매장에서는 이 쿠폰번호만 말씀하셔도 사용할 수 있습니다.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
