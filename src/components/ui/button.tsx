import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
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
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-2.5 text-sm font-semibold transition duration-200",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
