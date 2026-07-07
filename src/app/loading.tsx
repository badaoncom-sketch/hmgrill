export default function Loading() {
  return (
    <div className="grid min-h-[62vh] place-items-center">
      <div className="flex flex-col items-center gap-6">
        <span className="relative grid h-16 w-16 place-items-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-spin rounded-full border-2 border-[rgba(247,230,193,.14)] border-t-[var(--hm-primary)]"
          />
          <span className="hm-serif text-[15px] font-bold text-[var(--hm-primary)]">화목</span>
        </span>
        <p className="text-sm font-semibold text-white/40">불러오는 중입니다…</p>
      </div>
    </div>
  );
}
