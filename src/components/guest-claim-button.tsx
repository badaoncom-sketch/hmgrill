"use client";

import { useActionState } from "react";
import { Download } from "lucide-react";
import { claimGuestCouponAction } from "@/app/actions/guest-coupons";
import { Button } from "@/components/ui/button";

const initialState = { ok: false, message: "" };

export function GuestClaimButton({ claimToken }: { claimToken: string }) {
  const [state, formAction, isPending] = useActionState(
    claimGuestCouponAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid gap-2">
      <input type="hidden" name="claimToken" value={claimToken} />
      <Button type="submit" disabled={isPending} className="w-full">
        <Download size={16} aria-hidden="true" />
        {isPending ? "발급 중" : "쿠폰 받기"}
      </Button>
      {state.message ? (
        <p className="text-xs font-semibold text-[#f0a39b]" aria-live="polite">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
