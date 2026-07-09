"use client";

import { Save } from "lucide-react";
import { useActionState } from "react";
import { issueCouponAction } from "@/app/actions/coupons";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const defaultCondition =
  "300,000원 이상 결제 시 사용 가능합니다.\n타 쿠폰과 중복 사용이 불가능합니다.";

const defaultQrNotice =
  "쿠폰 화면의 QR코드 확인 후 사용 처리됩니다.\n사용 완료된 쿠폰은 다시 사용할 수 없습니다.";

const initialState = {
  ok: false,
  message: "",
};

export function CouponIssueForm() {
  const [state, formAction, isPending] = useActionState(
    issueCouponAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="쿠폰명">
          <Input name="name" placeholder="신규 회원 10,000원 쿠폰" required />
        </Field>
        <Field label="쿠폰 금액">
          <Input name="amount" min={0} placeholder="10000" required type="number" />
        </Field>
        <Field label="발행 수량">
          <Input name="quantity" min={1} placeholder="100" required type="number" />
        </Field>
        <Field label="다운로드 후 사용 가능 기간">
          <Select name="validityDays" defaultValue="10">
            <option value="7">7일</option>
            <option value="10">10일</option>
            <option value="15">15일</option>
            <option value="30">30일</option>
          </Select>
        </Field>
        <Field label="재다운로드 정책">
          <Select name="redownloadPolicy" defaultValue="after_use_allowed">
            <option value="after_use_allowed">사용 후 재다운로드 가능</option>
            <option value="once_per_member">회원당 1회만 다운로드 가능</option>
          </Select>
        </Field>
        <Field label="QR 사용 처리 방식">
          <Select name="useFlow" defaultValue="staff_confirm">
            <option value="auto_complete">자동 사용완료</option>
            <option value="staff_confirm">직원 확인 후 사용완료</option>
          </Select>
        </Field>
        <Field label="배포 방식">
          <Select name="distribution" defaultValue="open">
            <option value="open">홈페이지 공개 — 회원이 직접 다운로드</option>
            <option value="direct">관리자 지급 전용 — 홈페이지 비노출</option>
            <option value="guest">비회원 쿠폰 — 계산대 QR 발급</option>
          </Select>
        </Field>
      </div>
      <Field label="사용조건">
        <Textarea name="conditionText" defaultValue={defaultCondition} />
      </Field>
      <Field label="QR 안내사항">
        <Textarea name="qrNotice" defaultValue={defaultQrNotice} />
      </Field>
      <Button type="submit" className="w-full sm:w-fit" disabled={isPending}>
        <Save size={16} aria-hidden="true" />
        {isPending ? "발행 중" : "쿠폰 발행"}
      </Button>
      {state.message ? (
        <p className={state.ok ? "text-sm font-semibold text-emerald-200" : "text-sm font-semibold text-[#f0a39b]"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
