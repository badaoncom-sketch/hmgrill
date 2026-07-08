"use client";

import { Download } from "lucide-react";
import { useActionState, useState } from "react";
import { downloadCouponAction } from "@/app/actions/coupons";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

const initialState = {
  ok: false,
  message: "",
};

export function CouponDownloadForm({
  issueId,
  disabled,
  profileRequired = false,
  marketingConsented = false,
  profile,
}: {
  issueId: string;
  disabled?: boolean;
  profileRequired?: boolean;
  marketingConsented?: boolean;
  profile?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}) {
  const [state, formAction, isPending] = useActionState(
    downloadCouponAction,
    initialState,
  );
  const [privacyChecked, setPrivacyChecked] = useState(true);
  const [marketingChecked, setMarketingChecked] = useState(true);
  const allChecked = privacyChecked && marketingChecked;

  function toggleAll(checked: boolean) {
    setPrivacyChecked(checked);
    setMarketingChecked(checked);
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input name="issueId" type="hidden" value={issueId} />
      {profileRequired ? (
        <div className="mb-3 grid gap-4 rounded-[18px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--hm-primary)]">
              쿠폰 수령 정보
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--hm-subtext)]">
              최초 1회만 입력합니다. 저장된 정보는 마이페이지에서 확인할 수 있으며,
              다음 쿠폰부터 다시 입력하지 않습니다.
            </p>
          </div>
          <Field label="이름">
            <Input name="name" defaultValue={profile?.name ?? ""} placeholder="홍길동" required />
          </Field>
          <Field label="연락처">
            <Input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              inputMode="tel"
              placeholder="010-0000-0000"
              required
            />
          </Field>
          <Field label="주소">
            <Textarea
              name="address"
              defaultValue={profile?.address ?? ""}
              placeholder="쿠폰 이용 확인에 필요한 주소를 입력해 주세요."
              required
            />
          </Field>
          <div className="grid gap-2">
            <label className="flex gap-3 rounded-[14px] border border-[rgba(247,230,193,.28)] bg-[rgba(247,230,193,.05)] p-3 text-sm font-bold text-[var(--hm-text)]">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(event) => toggleAll(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--hm-primary)]"
              />
              모두 동의합니다
            </label>
            <label className="flex gap-3 rounded-[14px] border border-[var(--hm-border)] p-3 text-xs leading-5 text-[var(--hm-subtext)]">
              <input
                name="privacyAccepted"
                type="checkbox"
                value="yes"
                required
                checked={privacyChecked}
                onChange={(event) => setPrivacyChecked(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--hm-primary)]"
              />
              <span>
                <span className="font-bold text-[var(--hm-text)]">(필수)</span> 개인정보처리
                안내에 동의합니다. 입력한 이름, 연락처, 주소는 회원 식별, 쿠폰 발급 및
                사용 확인, 고객 응대 목적으로 이용되며 법령 또는 운영상 필요한 기간 동안
                보관됩니다.
              </span>
            </label>
            <label className="flex gap-3 rounded-[14px] border border-[var(--hm-border)] p-3 text-xs leading-5 text-[var(--hm-subtext)]">
              <input
                name="marketingAccepted"
                type="checkbox"
                value="yes"
                checked={marketingChecked}
                onChange={(event) => setMarketingChecked(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--hm-primary)]"
              />
              <span>
                <span className="font-bold text-[var(--hm-text)]">(선택)</span> 이벤트·혜택
                소식 수신에 동의합니다. 행사나 이벤트가 있을 때 입력한 정보로 이메일,
                문자(SMS), DM을 받아볼 수 있으며, 동의하지 않아도 쿠폰 이용에는 제한이
                없습니다. 동의는 마이페이지에서 언제든지 철회할 수 있습니다.
              </span>
            </label>
          </div>
        </div>
      ) : null}
      {!profileRequired && !marketingConsented ? (
        <label className="mb-1 flex gap-3 rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-3 text-xs leading-5 text-[var(--hm-subtext)]">
          <input
            name="marketingAccepted"
            type="checkbox"
            value="yes"
            defaultChecked
            className="mt-1 h-4 w-4 accent-[var(--hm-primary)]"
          />
          <span>
            <span className="font-bold text-[var(--hm-text)]">(선택)</span> 이벤트·혜택
            소식을 이메일, 문자(SMS), DM으로 받는 것에 동의합니다. 동의는 마이페이지에서
            언제든지 철회할 수 있습니다.
          </span>
        </label>
      ) : null}
      <Button type="submit" disabled={disabled || isPending}>
        <Download size={16} aria-hidden="true" />
        {isPending
          ? "다운로드 중"
          : profileRequired
            ? "정보 입력하고 쿠폰 받기"
            : "쿠폰 다운로드"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-xs text-emerald-700" : "text-xs text-red-700"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
