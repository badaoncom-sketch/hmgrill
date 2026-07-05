import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "neutral" | "green" | "red" | "amber";
};

const tones = {
  neutral: "border-[var(--hm-border)] bg-white/[0.04] text-[var(--hm-subtext)]",
  green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  red: "border-[var(--hm-accent-red)]/30 bg-[var(--hm-accent-red)]/12 text-[#f0a39b]",
  amber: "border-[var(--hm-primary)]/35 bg-[var(--hm-primary)]/10 text-[var(--hm-primary)]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
