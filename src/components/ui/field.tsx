"use client";

import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Ref,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--hm-text)]">
      {label}
      {children}
    </label>
  );
}

const inputBaseClass =
  "min-h-11 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-3 py-2 text-sm text-[var(--hm-text)] outline-none transition placeholder:text-[var(--hm-subtext)] focus:border-[var(--hm-primary)] focus:ring-2 focus:ring-[rgba(247,230,193,.18)]";

// X 지우기 버튼을 기본으로 붙이는 텍스트 계열 타입.
const clearableTypes = new Set<string | undefined>([
  undefined,
  "text",
  "email",
  "tel",
  "search",
  "url",
]);

function hasText(value: unknown) {
  return value !== undefined && value !== null && String(value).length > 0;
}

export function Input({
  className,
  clearable,
  ref,
  ...props
}: ComponentPropsWithoutRef<"input"> & {
  clearable?: boolean;
  ref?: Ref<HTMLInputElement>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [innerHasValue, setInnerHasValue] = useState(
    () => hasText(props.value) || hasText(props.defaultValue),
  );

  const showClear =
    (clearable ?? clearableTypes.has(props.type)) &&
    !props.disabled &&
    !props.readOnly;

  if (!showClear) {
    return <input ref={ref} className={cn(inputBaseClass, className)} {...props} />;
  }

  const hasValue = props.value !== undefined ? hasText(props.value) : innerHasValue;

  function clearInput() {
    const input = inputRef.current;
    if (!input) return;
    // 제어/비제어 입력 모두에서 onChange가 실행되도록 네이티브 setter로 비운다.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    setInnerHasValue(false);
    input.focus();
  }

  return (
    <span className="relative block min-w-0 flex-1">
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(inputBaseClass, "w-full pr-10", className)}
        onInput={(event) => {
          setInnerHasValue(event.currentTarget.value.length > 0);
          props.onInput?.(event);
        }}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={clearInput}
          aria-label="입력 내용 지우기"
          className="hm-link-focus absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--hm-subtext)] transition hover:bg-white/[0.07] hover:text-[var(--hm-primary)]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-3 py-2 text-sm text-[var(--hm-text)] outline-none transition placeholder:text-[var(--hm-subtext)] focus:border-[var(--hm-primary)] focus:ring-2 focus:ring-[rgba(247,230,193,.18)]",
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
        "min-h-11 rounded-[12px] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-3 py-2 text-sm text-[var(--hm-text)] outline-none transition focus:border-[var(--hm-primary)] focus:ring-2 focus:ring-[rgba(247,230,193,.18)]",
        className,
      )}
      {...props}
    />
  );
}
