"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

// 공용 Button을 쓰기엔 스타일이 다른 소형 submit 버튼용.
// 서버 액션 처리 중 스피너(기본) 또는 흐림(dim)으로 진행 상태를 보여준다.
export function InlineSubmitButton({
  children,
  className = "",
  dim = false,
}: {
  children: ReactNode;
  className?: string;
  dim?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? "pointer-events-none opacity-60" : ""}`}
    >
      {pending && !dim ? (
        <Spinner className="mr-1.5 inline-block h-3 w-3 align-[-1px]" />
      ) : null}
      {children}
    </button>
  );
}
