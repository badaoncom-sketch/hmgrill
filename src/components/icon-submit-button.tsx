"use client";

import { useFormStatus } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function IconSubmitButton({
  icon: Icon,
  label,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      title={label}
      aria-label={label}
      className={`hm-link-focus grid h-9 w-9 place-items-center rounded-[10px] text-white/40 transition hover:bg-white/[0.06] disabled:opacity-60 ${
        danger ? "hover:text-[var(--hm-accent-red)]" : "hover:text-[var(--hm-primary)]"
      }`}
    >
      {pending ? <Spinner className="h-4 w-4" /> : <Icon size={16} aria-hidden="true" />}
    </button>
  );
}
