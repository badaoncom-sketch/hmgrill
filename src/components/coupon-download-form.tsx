"use client";

import { Download } from "lucide-react";
import { useActionState } from "react";
import { downloadCouponAction } from "@/app/actions/coupons";
import { Button } from "@/components/ui/button";

const initialState = {
  ok: false,
  message: "",
};

export function CouponDownloadForm({
  issueId,
  disabled,
}: {
  issueId: string;
  disabled?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    downloadCouponAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-2">
      <input name="issueId" type="hidden" value={issueId} />
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
