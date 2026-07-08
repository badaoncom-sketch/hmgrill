"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, PencilLine, X } from "lucide-react";
import {
  updateContactInfoAction,
  type ContactActionState,
} from "@/app/actions/profile";
import { AddressSearchInput } from "@/components/address-search-input";
import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const initialState: ContactActionState = {
  ok: false,
  message: "",
};

// 마이페이지 개인정보 목록 아래에서 연락처·주소를 그 자리에서 수정한다.
export function ContactInfoEditor({
  phone,
  address,
}: {
  phone: string;
  address: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateContactInfoAction,
    initialState,
  );

  // 저장에 성공하면 잠시 완료 메시지를 보여준 뒤 폼을 접는다.
  useEffect(() => {
    if (!state.ok) return;
    const timer = setTimeout(() => setEditing(false), 900);
    return () => clearTimeout(timer);
  }, [state]);

  if (!editing) {
    return (
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(true)}
          className="min-h-9 px-3.5 text-xs"
        >
          <PencilLine size={14} aria-hidden="true" />
          연락처·주소 수정
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-4 grid gap-4 rounded-[18px] border border-[rgba(247,230,193,.2)] bg-black/20 p-4 sm:p-5"
    >
      <p className="text-sm font-semibold text-[var(--hm-primary)]">
        연락처·주소 수정
      </p>
      <Field label="연락처">
        <PhoneInput name="phone" defaultValue={phone} required disabled={isPending} />
      </Field>
      <AddressSearchInput defaultValue={address} />
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setEditing(false)}
          disabled={isPending}
          className="min-h-10 px-4 text-sm"
        >
          <X size={14} aria-hidden="true" />
          취소
        </Button>
        <Button type="submit" disabled={isPending} className="min-h-10 px-5 text-sm">
          <Check size={14} aria-hidden="true" />
          {isPending ? "저장 중" : "저장"}
        </Button>
      </div>
      {state.message ? (
        <p
          className={`text-xs ${state.ok ? "text-emerald-200" : "text-[#f0a39b]"}`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
