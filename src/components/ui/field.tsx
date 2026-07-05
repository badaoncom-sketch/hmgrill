import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--hm-text)]">
      {label}
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "min-h-11 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-3 py-2 text-sm text-[var(--hm-text)] outline-none transition placeholder:text-[var(--hm-subtext)] focus:border-[var(--hm-primary)] focus:ring-2 focus:ring-[rgba(247,230,193,.18)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-3 py-2 text-sm text-[var(--hm-text)] outline-none transition placeholder:text-[var(--hm-subtext)] focus:border-[var(--hm-primary)] focus:ring-2 focus:ring-[rgba(247,230,193,.18)]",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={cn(
        "min-h-11 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-3 py-2 text-sm text-[var(--hm-text)] outline-none transition focus:border-[var(--hm-primary)] focus:ring-2 focus:ring-[rgba(247,230,193,.18)]",
        className,
      )}
      {...props}
    />
  );
}
