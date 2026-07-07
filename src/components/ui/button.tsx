"use client";

import Link, { useLinkStatus } from "next/link";
import { useFormStatus } from "react-dom";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

const variants = {
  primary: "bg-[var(--hm-primary)] text-[var(--hm-background)] hover:bg-[var(--hm-accent-gold)] hover:text-white",
  secondary: "bg-[var(--hm-card)] text-[var(--hm-primary)] hover:bg-[var(--hm-surface)]",
  outline: "border border-[var(--hm-primary)] bg-transparent text-[var(--hm-primary)] hover:bg-[var(--hm-accent-gold)] hover:text-white",
  ghost: "text-[var(--hm-subtext)] hover:bg-white/[0.04] hover:text-[var(--hm-primary)]",
  danger: "bg-[var(--hm-accent-red)] text-white hover:bg-[#9f2f25]",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) {
  // form 안의 제출 버튼이면 서버 액션 처리 중 자동으로 스피너를 보여준다.
  const { pending } = useFormStatus();
  const isPending = pending && type === "submit";

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      disabled={disabled || isPending}
      {...props}
    >
      {isPending ? <Spinner /> : null}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  variant?: ButtonProps["variant"];
};

function LinkPendingSpinner() {
  // 이 링크로 시작된 페이지 이동이 진행 중일 때만 표시된다.
  const { pending } = useLinkStatus();
  return pending ? <Spinner className="h-3.5 w-3.5" /> : null;
}

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-2.5 text-sm font-semibold transition duration-200",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
      <LinkPendingSpinner />
    </Link>
  );
}
