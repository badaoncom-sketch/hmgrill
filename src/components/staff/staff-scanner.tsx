"use client";

import { CheckCircle, ScanLine } from "lucide-react";
import { useActionState } from "react";
import { lookupCouponAction, useCouponAction } from "@/app/actions/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { formatCurrency, formatDate } from "@/lib/utils";

type StaffScannerState = Awaited<ReturnType<typeof lookupCouponAction>>;

const initialState: StaffScannerState = {
  ok: false,
  message: "",
};

export function StaffScanner() {
  const [lookupState, lookupFormAction, isLookupPending] = useActionState(
    lookupCouponAction,
    initialState,
  );
  const [useState, useFormAction, isUsePending] = useActionState(
    useCouponAction,
    initialState,
  );
  const coupon = useState.coupon ?? lookupState.coupon;
  const canUse = useState.coupon ? useState.canUse : lookupState.canUse;
  const message = useState.message || lookupState.message;
  const messageOk = useState.message ? useState.ok : lookupState.ok;

  return (
    <div className="grid gap-5">
      <Card>
        <CardContent className="grid gap-4">
          <form action={lookupFormAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[var(--hm-text)]">
              QR 스캔 입력
              <Input
                name="token"
                placeholder="QR 리더기로 토큰을 스캔하세요"
                autoFocus
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" disabled={isLookupPending}>
                <ScanLine size={16} aria-hidden="true" />
                {isLookupPending ? "조회 중" : "쿠폰 조회"}
              </Button>
              <p className="text-sm text-[var(--hm-subtext)]">
                QR 리더기는 키보드 입력 장치처럼 토큰을 입력하는 것을 기준으로
                합니다.
              </p>
            </div>
          </form>
          {message ? (
            <p
              className={
                messageOk ? "text-sm text-emerald-700" : "text-sm text-red-700"
              }
            >
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {coupon ? (
        <Card>
          <CardContent className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge tone={coupon.status === "available" ? "green" : "red"}>
                  {coupon.status === "available" ? "사용 가능" : "사용 불가"}
                </Badge>
                <h2 className="mt-3 text-2xl font-bold text-[var(--hm-text)]">
                  {coupon.couponName}
                </h2>
                <p className="mt-1 text-xl font-bold text-[var(--hm-accent-gold)]">
                  {formatCurrency(coupon.amount)}
                </p>
              </div>
              <ScanLine className="text-[var(--hm-subtext)]" size={36} aria-hidden="true" />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">회원명</dt>
                <dd className="text-[var(--hm-subtext)]">{coupon.memberName || "-"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">쿠폰번호</dt>
                <dd className="font-bold text-[var(--hm-primary)]">{coupon.couponNumber}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--hm-text)]">사용기간</dt>
                <dd className="text-[var(--hm-subtext)]">
                  {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-[var(--hm-text)]">사용조건</dt>
                <dd className="whitespace-pre-line text-[var(--hm-subtext)]">
                  {coupon.conditionText}
                </dd>
              </div>
            </dl>
            {canUse ? (
              <form action={useFormAction}>
                <input name="token" type="hidden" value={coupon.token} />
                <Button
                  type="submit"
                  className="w-full sm:w-fit"
                  disabled={isUsePending}
                >
                  <CheckCircle size={16} aria-hidden="true" />
                  {isUsePending ? "처리 중" : "사용 완료"}
                </Button>
              </form>
            ) : (
              <div className="rounded-[14px] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-4 text-sm text-[var(--hm-subtext)]">
                이미 사용되었거나 기간이 만료된 쿠폰입니다.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm font-semibold text-[var(--hm-subtext)]">
              스캔한 쿠폰 정보가 여기에 표시됩니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
