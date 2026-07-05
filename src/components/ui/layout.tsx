import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("hm-container", className)} {...props} />;
}

export function Content({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("hm-content", className)} {...props} />;
}

export function Section({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return <section className={cn("hm-section", className)} {...props} />;
}
