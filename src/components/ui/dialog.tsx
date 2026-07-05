import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)] p-6 shadow-[var(--hm-shadow)]",
        className,
      )}
      role="dialog"
      {...props}
    />
  );
}

export function Modal({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("fixed inset-0 z-50 grid place-items-center bg-black/70 p-5", className)}
      {...props}
    />
  );
}
