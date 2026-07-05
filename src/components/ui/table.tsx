import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--hm-border)] bg-[var(--hm-card)]">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({
  className,
  ...props
}: ComponentPropsWithoutRef<"thead">) {
  return <thead className={cn("bg-white/[0.03]", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--hm-divider)] transition hover:bg-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"th">) {
  return (
    <th
      className={cn(
        "px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--hm-accent-gold)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("px-5 py-4 text-[var(--hm-subtext)]", className)} {...props} />;
}
