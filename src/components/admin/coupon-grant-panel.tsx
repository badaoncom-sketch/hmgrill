"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { BadgeCheck, Gift, Search, UserRound, X } from "lucide-react";
import {
  grantAdhocCouponAction,
  grantCouponAction,
  searchGrantMembersAction,
  type GrantActionState,
  type GrantMemberResult,
} from "@/app/actions/coupon-grants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

const initialState: GrantActionState = { ok: false, message: "" };

const AMOUNT_PRESETS = [10000, 30000, 50000, 100000];

export type GrantableIssue = {
  id: string;
  name: string;
  amount: number;
  remaining: number;
  validityDays: number;
};

function formatAmountInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

export function CouponGrantPanel({ issues }: { issues: GrantableIssue[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GrantMemberResult[]>([]);
  const [member, setMember] = useState<GrantMemberResult | null>(null);
  const [mode, setMode] = useState<"stock" | "adhoc">(
    issues.length > 0 ? "stock" : "adhoc",
  );
  const [amountText, setAmountText] = useState("50,000");
  const [isSearching, startSearch] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stockState, stockAction, isStockPending] = useActionState(
    grantCouponAction,
    initialState,
  );
  const [adhocState, adhocAction, isAdhocPending] = useActionState(
    grantAdhocCouponAction,
    initialState,
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startSearch(async () => {
        setResults(await searchGrantMembersAction(value));
      });
    }, 300);
  }

  const activeState = mode === "stock" ? stockState : adhocState;

  return (
    <div className="grid gap-4 p-5">
      {/* 1단계: 회원 검색 → UID 확인 */}
      {member === null ? (
        <div>
          <label className="flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--hm-border)] bg-black/20 px-4 transition focus-within:border-[var(--hm-primary)]">
            {isSearching ? (
              <Spinner className="h-4 w-4 shrink-0 text-[var(--hm-accent-gold)]" />
            ) : (
              <Search size={16} className="shrink-0 text-[var(--hm-subtext)]" aria-hidden="true" />
            )}
            <input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="회원 UID, 이름, 이메일, 전화번호 검색"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--hm-text)] outline-none placeholder:text-[var(--hm-subtext)]"
            />
          </label>
          {query.trim().length >= 2 ? (
            <div className="mt-2 overflow-hidden rounded-[14px] border border-[var(--hm-border)]">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMember(item)}
                  className="hm-link-focus flex w-full items-center gap-3 border-b border-[var(--hm-divider)] px-4 py-3 text-left transition last:border-b-0 hover:bg-white/[0.04]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[rgba(247,230,193,.24)] text-[var(--hm-accent-gold)]">
                    <UserRound size={16} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white/85">
                      {item.name}
                      <span className="ml-2 font-mono text-xs tracking-[0.12em] text-[var(--hm-accent-gold)]">
                        UID {item.memberUid}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-white/45">
                      {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </span>
                  </span>
                </button>
              ))}
              {!isSearching && results.length === 0 ? (
                <p className="px-4 py-4 text-center text-xs font-semibold text-white/40">
                  검색 결과가 없습니다.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-xs text-white/40">
              두 글자 이상 입력하면 실시간으로 검색됩니다.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* 선택된 회원 확인 카드 */}
          <div className="flex items-center gap-3 rounded-[14px] border border-[rgba(247,230,193,.24)] bg-[rgba(247,230,193,.05)] px-4 py-3">
            <BadgeCheck size={18} className="shrink-0 text-[var(--hm-accent-gold)]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {member.name}
                <span className="ml-2 font-mono text-[13px] tracking-[0.14em] text-[var(--hm-primary)]">
                  UID {member.memberUid}
                </span>
              </p>
              <p className="mt-0.5 truncate text-xs text-white/45">
                {member.email}
                {member.phone ? ` · ${member.phone}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMember(null);
                setQuery("");
                setResults([]);
              }}
              aria-label="회원 다시 선택"
              className="hm-link-focus grid size-8 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/[0.06] hover:text-white/80"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>

          {/* 2단계: 지급 방식 */}
          <div className="flex gap-1 rounded-[12px] border border-[var(--hm-border)] bg-black/20 p-1">
            {(
              [
                { key: "stock", label: "발행 쿠폰에서 지급" },
                { key: "adhoc", label: "즉석 금액 지급" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={`hm-link-focus min-h-9 flex-1 rounded-[9px] text-[13px] font-bold transition ${
                  mode === tab.key
                    ? "bg-[var(--hm-primary)] text-[#171009]"
                    : "text-white/55 hover:text-white/85"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "stock" ? (
            <form
              action={stockAction}
              onSubmit={(event) => {
                if (!window.confirm(`${member.name} (UID ${member.memberUid})님에게 쿠폰을 지급할까요?`)) {
                  event.preventDefault();
                }
              }}
              className="grid gap-3"
            >
              <input type="hidden" name="memberId" value={member.id} />
              {issues.length > 0 ? (
                <>
                  <Field label="지급할 쿠폰">
                    <Select name="issueId" required>
                      {issues.map((issue) => (
                        <option key={issue.id} value={issue.id}>
                          {issue.name} · {formatCurrency(issue.amount)} · 남은 {issue.remaining}장 · {issue.validityDays}일
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="지급 사유 (내부 메모, 선택)">
                    <Input name="note" placeholder="예: 단골 감사, 서비스 보상" maxLength={200} />
                  </Field>
                  <Button type="submit" disabled={isStockPending}>
                    <Gift size={15} aria-hidden="true" />
                    {isStockPending ? "지급 중" : "쿠폰 지급"}
                  </Button>
                </>
              ) : (
                <p className="rounded-[12px] border border-dashed border-white/[0.14] bg-black/20 p-4 text-center text-xs font-semibold text-white/45">
                  지급 전용 발행 쿠폰이 없습니다. 쿠폰 생성에서 배포 방식을
                  &lsquo;관리자 지급 전용&rsquo;으로 발행하거나, 즉석 금액 지급을 이용하세요.
                </p>
              )}
            </form>
          ) : (
            <form
              action={adhocAction}
              onSubmit={(event) => {
                if (
                  !window.confirm(
                    `${member.name} (UID ${member.memberUid})님에게 ₩${amountText} 쿠폰을 지급할까요?`,
                  )
                ) {
                  event.preventDefault();
                }
              }}
              className="grid gap-3"
            >
              <input type="hidden" name="memberId" value={member.id} />
              <Field label="지급 금액 (원)">
                <div className="grid gap-2">
                  <Input
                    name="amount"
                    value={amountText}
                    onChange={(event) => setAmountText(formatAmountInput(event.target.value))}
                    inputMode="numeric"
                    required
                    placeholder="50,000"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {AMOUNT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmountText(preset.toLocaleString("ko-KR"))}
                        className="hm-link-focus rounded-full border border-[var(--hm-border)] px-3 py-1.5 text-xs font-bold text-white/60 transition hover:border-[rgba(247,230,193,.32)] hover:text-[var(--hm-primary)]"
                      >
                        {preset / 10000}만원
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="쿠폰명">
                  <Input
                    name="name"
                    defaultValue="화목 감사 할인 쿠폰"
                    required
                    maxLength={60}
                  />
                </Field>
                <Field label="유효기간 (일)">
                  <Input
                    name="validityDays"
                    type="number"
                    defaultValue={30}
                    min={1}
                    max={365}
                    required
                  />
                </Field>
              </div>
              <Field label="사용조건">
                <Textarea
                  name="conditionText"
                  defaultValue={"타 쿠폰과 중복 사용이 불가능합니다."}
                  className="min-h-20"
                />
              </Field>
              <Field label="지급 사유 (내부 메모, 선택)">
                <Input name="note" placeholder="예: 컴플레인 보상, 특별 감사" maxLength={200} />
              </Field>
              <Button type="submit" disabled={isAdhocPending}>
                <Gift size={15} aria-hidden="true" />
                {isAdhocPending ? "지급 중" : `₩${amountText || 0} 즉석 지급`}
              </Button>
            </form>
          )}

          {activeState.message ? (
            <p
              className={`text-xs font-semibold ${activeState.ok ? "text-emerald-200" : "text-[#f0a39b]"}`}
              aria-live="polite"
            >
              {activeState.message}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
