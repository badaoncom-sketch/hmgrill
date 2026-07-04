import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
};

const variants = {
  primary: "bg-red-700 text-white hover:bg-red-800",
  secondary: "bg-neutral-950 text-white hover:bg-neutral-800",
  outline: "border border-neutral-300 bg-white text-neutral-950 hover:border-neutral-950",
  ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
  danger: "bg-red-900 text-white hover:bg-red-950",
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
