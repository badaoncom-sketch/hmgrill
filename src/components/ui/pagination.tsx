import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Pagination({
  className,
  ...props
}: ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="페이지 이동"
      {...props}
    />
  );
}

export function PaginationLink({
  active = false,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { active?: boolean }) {
  return (
    <Link
      className={cn(
        "hm-link-focus grid h-9 min-w-9 place-items-center rounded-[12px] px-3 text-sm font-semibold transition",
        active
          ? "bg-[var(--hm-primary)] text-[var(--hm-background)]"
          : "border border-[var(--hm-border)] text-[var(--hm-subtext)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]",
        className,
      )}
      {...props}
    />
  );
}
