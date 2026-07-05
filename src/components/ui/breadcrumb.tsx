import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Breadcrumb({
  className,
  ...props
}: ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      className={cn("flex items-center gap-2 text-xs text-[var(--hm-subtext)]", className)}
      aria-label="현재 위치"
      {...props}
    />
  );
}

export function BreadcrumbLink({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn("hm-link-focus hover:text-[var(--hm-primary)]", className)}
      {...props}
    />
  );
}

export function BreadcrumbCurrent({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("text-[var(--hm-primary)]", className)} {...props} />;
}
