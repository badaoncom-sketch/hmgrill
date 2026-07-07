"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

// 서버 컴포넌트에서 아이콘을 렌더링해 children으로 넘긴다.
// (컴포넌트 함수 자체는 서버→클라이언트 prop으로 직렬화할 수 없다.)
export function IconSubmitButton({
  children,
  label,
  danger = false,
}: {
  children: ReactNode;
  label: string;
  danger?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      title={label}
      aria-label={label}
      className={`hm-link-focus grid h-9 w-9 place-items-center rounded-[10px] text-white/40 transition hover:bg-white/[0.06] disabled:opacity-60 ${
        danger ? "hover:text-[var(--hm-accent-red)]" : "hover:text-[var(--hm-primary)]"
      }`}
    >
      {pending ? <Spinner className="h-4 w-4" /> : children}
    </button>
  );
}
