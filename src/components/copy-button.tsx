"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// 텍스트 옆에 붙이는 심플 복사 아이콘 버튼. 복사되면 잠시 체크로 바뀐다.
export function CopyButton({
  value,
  ariaLabel,
  className = "",
}: {
  value: string;
  ariaLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "복사 완료" : ariaLabel}
      className={`hm-link-focus inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] text-white/45 transition hover:bg-white/[0.07] hover:text-[var(--hm-primary)] ${className}`}
    >
      {copied ? (
        <Check size={14} className="text-emerald-300" aria-hidden="true" />
      ) : (
        <Copy size={14} aria-hidden="true" />
      )}
    </button>
  );
}
