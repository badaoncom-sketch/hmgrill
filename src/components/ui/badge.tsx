import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: "neutral" | "green" | "red" | "amber";
};

const tones = {
  neutral: "bg-[#17130f0d] text-[#5f554a]",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-[#B13A1E1a] text-[#8f2e18]",
  amber: "bg-[#F7E6C1] text-[#6d4b13]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
