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
    <label className="grid gap-2 text-sm font-medium text-[#17130f]">
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
        "min-h-11 rounded-md border border-[#17130f33] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8a7c6d] focus:border-[#B13A1E] focus:ring-2 focus:ring-[#B13A1E1f]",
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
        "min-h-28 rounded-md border border-[#17130f33] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#8a7c6d] focus:border-[#B13A1E] focus:ring-2 focus:ring-[#B13A1E1f]",
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
        "min-h-11 rounded-md border border-[#17130f33] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#B13A1E] focus:ring-2 focus:ring-[#B13A1E1f]",
        className,
      )}
      {...props}
    />
  );
}
