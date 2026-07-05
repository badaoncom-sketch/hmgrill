import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border-b border-[var(--hm-divider)] pb-3",
        className,
      )}
      {...props}
    />
  );
}

export function Tab({
  active = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-[14px] px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-[var(--hm-primary)] text-[var(--hm-background)]"
          : "border border-[var(--hm-border)] text-[var(--hm-subtext)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]",
        className,
      )}
      type="button"
      {...props}
    />
  );
}
