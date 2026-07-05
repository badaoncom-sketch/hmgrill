import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

const variants = {
  primary: "bg-[#B13A1E] text-white shadow-sm shadow-[#B13A1E]/20 hover:bg-[#8f2e18]",
  secondary: "bg-[#17130f] text-[#F7E6C1] hover:bg-[#27231E]",
  outline: "border border-[#17130f33] bg-white/80 text-[#17130f] hover:border-[#17130f] hover:bg-white",
  ghost: "text-[#5f554a] hover:bg-[#17130f0d] hover:text-[#17130f]",
  danger: "bg-[#6f1f14] text-white hover:bg-[#54160f]",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  variant?: ButtonProps["variant"];
};

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
