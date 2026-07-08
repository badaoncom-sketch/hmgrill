"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// 입력과 동시에 URL 쿼리를 갱신해 서버가 필터링된 목록을 다시 그린다.
export function LiveSearchInput({
  paramKey = "q",
  placeholder = "검색어를 입력하세요",
  className,
}: {
  paramKey?: string;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const urlValue = searchParams.get(paramKey) ?? "";
  const [hasValue, setHasValue] = useState(() => urlValue.length > 0);

  // 뒤로가기·초기화 링크 등으로 URL이 바뀌면 입력값을 맞춘다 (타이핑 중에는 건드리지 않음).
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input && input.value !== urlValue) {
      input.value = urlValue;
      setHasValue(urlValue.length > 0);
    }
  }, [urlValue]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  function handleChange(value: string) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const trimmed = value.trim();
      if (trimmed) {
        params.set(paramKey, trimmed);
      } else {
        params.delete(paramKey);
      }
      const queryString = params.toString();
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    }, 300);
  }

  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 transition focus-within:border-[var(--hm-primary)] focus-within:ring-2 focus-within:ring-[rgba(247,230,193,.18)]",
        className,
      )}
    >
      {isPending ? (
        <Spinner className="h-4 w-4 shrink-0 text-[var(--hm-accent-gold)]" />
      ) : (
        <Search size={16} className="shrink-0 text-[var(--hm-subtext)]" aria-hidden="true" />
      )}
      <input
        ref={inputRef}
        type="search"
        defaultValue={urlValue}
        onChange={(event) => {
          setHasValue(event.target.value.length > 0);
          handleChange(event.target.value);
        }}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--hm-text)] outline-none placeholder:text-[var(--hm-subtext)] [&::-webkit-search-cancel-button]:hidden"
      />
      {hasValue ? (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => {
            const input = inputRef.current;
            if (input) input.value = "";
            setHasValue(false);
            handleChange("");
            input?.focus();
          }}
          className="hm-link-focus inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--hm-subtext)] transition hover:bg-white/[0.07] hover:text-[var(--hm-primary)]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </label>
  );
}
