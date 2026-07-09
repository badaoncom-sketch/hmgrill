"use client";

import { useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Search } from "lucide-react";
import { Select } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

// 쿠폰 목록 실시간 필터: 상태·종류는 선택 즉시, 검색어는 입력과 동시에(디바운스)
// URL 쿼리를 갱신해 서버가 필터링된 목록을 다시 그린다. 전체 리로드가 없다.
export function CouponListFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function apply(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleQueryChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply({ q: value.trim() }), 350);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[130px_150px_150px_minmax(0,1fr)]">
      <Select
        aria-label="쿠폰 상태"
        value={searchParams.get("status") ?? "all"}
        onChange={(event) => apply({ status: event.target.value })}
      >
        <option value="all">전체 상태</option>
        <option value="issuing">활성</option>
        <option value="ended">종료</option>
      </Select>
      <Select
        aria-label="쿠폰 종류"
        value={searchParams.get("type") ?? "all"}
        onChange={(event) => apply({ type: event.target.value })}
      >
        <option value="all">전체 종류</option>
        <option value="open">홈페이지 공개</option>
        <option value="direct">지급 전용</option>
        <option value="guest">비회원 QR</option>
      </Select>
      <div className="hidden min-h-11 items-center justify-between rounded-[12px] border border-[rgba(255,255,255,.09)] bg-black/20 px-3 text-sm font-semibold text-white/62 lg:flex">
        전체 매장
        <CalendarDays size={15} aria-hidden="true" />
      </div>
      <label className="flex min-h-11 items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,.09)] bg-black/20 px-3 text-sm font-semibold text-white/42 transition focus-within:border-[var(--hm-primary)] sm:col-span-2 lg:col-span-1">
        {isPending ? (
          <Spinner className="h-4 w-4 shrink-0 text-[var(--hm-accent-gold)]" />
        ) : (
          <Search size={16} className="shrink-0" aria-hidden="true" />
        )}
        <input
          type="search"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="쿠폰명, ID, 쿠폰번호 실시간 검색"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--hm-text)] outline-none placeholder:text-[var(--hm-subtext)] [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
    </div>
  );
}
