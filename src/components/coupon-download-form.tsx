"use client";

import { Download } from "lucide-react";
import { useActionState } from "react";
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
  profile,
}: {
  issueId: string;
  disabled?: boolean;
  profileRequired?: boolean;
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
          <label className="flex gap-3 rounded-[14px] border border-[var(--hm-border)] p-3 text-xs leading-5 text-[var(--hm-subtext)]">
            <input
              name="privacyAccepted"
              type="checkbox"
              value="yes"
              required
              className="mt-1 h-4 w-4 accent-[var(--hm-primary)]"
            />
            <span>
              개인정보처리 안내에 동의합니다. 입력한 이름, 연락처, 주소는 회원 식별,
              쿠폰 발급 및 사용 확인, 고객 응대 목적으로 이용되며 법령 또는 운영상
              필요한 기간 동안 보관됩니다.
            </span>
          </label>
        </div>
      ) : null}
      <Button type="submit" disabled={disabled || isPending}>
        <Download size={16} aria-hidden="true" />
        {isPending ? "다운로드 중" : "쿠폰 다운로드"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-xs text-emerald-700" : "text-xs text-red-700"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
