"use client";

import { Eye, EyeOff, X } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  useActionState,
  useRef,
  useState,
} from "react";
import {
  loginAction,
  requestPasswordResetAction,
  resendVerificationAction,
  signupAction,
  updatePasswordAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

const initialState: AuthActionState = {
  ok: false,
  message: "",
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="이메일">
        <Input
          name="email"
          type="email"
          placeholder="member@example.com"
          required
          disabled={isPending}
        />
      </Field>
      <Field label="비밀번호">
        <PasswordInput name="password" minLength={8} required disabled={isPending} />
      </Field>
      <SubmitButton pending={isPending} label="회원가입" pendingLabel="가입 처리 중" />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

export function PasswordResetRequestForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="가입 이메일">
        <Input
          name="email"
          type="email"
          placeholder="member@example.com"
          required
          disabled={isPending}
        />
      </Field>
      <SubmitButton
        pending={isPending}
        label="비밀번호 재설정 메일 받기"
        pendingLabel="메일 발송 중"
      />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="새 비밀번호">
        <PasswordInput name="password" minLength={8} required disabled={isPending} />
      </Field>
      <Field label="새 비밀번호 확인">
        <PasswordInput
          name="passwordConfirm"
          minLength={8}
          required
          disabled={isPending}
        />
      </Field>
      <SubmitButton pending={isPending} label="비밀번호 변경" pendingLabel="변경 중" />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="이메일">
        <Input
          name="email"
          type="email"
          placeholder="member@example.com"
          required
          disabled={isPending}
        />
      </Field>
      <Field label="비밀번호">
        <PasswordInput name="password" required disabled={isPending} />
      </Field>
      <label className="hm-link-focus flex items-start gap-3 rounded-[14px] border border-[var(--hm-border)] bg-white/[0.03] p-3 text-sm text-[var(--hm-subtext)] transition hover:border-[rgba(247,230,193,.22)]">
        <input
          name="rememberMe"
          type="checkbox"
          defaultChecked
          disabled={isPending}
          className="mt-0.5 size-4 rounded border-[var(--hm-border)] accent-[var(--hm-primary)]"
        />
        <span className="grid gap-1">
          <span className="font-semibold text-[var(--hm-text)]">자동 로그인</span>
          <span className="text-xs leading-5">
            개인 기기에서는 로그인 상태를 유지합니다. 공용 기기에서는 선택을 해제해 주세요.
          </span>
        </span>
      </label>
      <SubmitButton pending={isPending} label="로그인" pendingLabel="로그인 중" />
      <ActionMessage ok={state.ok} message={state.message} />
      {state.needsVerification ? (
        <div className="rounded-[14px] border border-[rgba(247,230,193,.22)] bg-[rgba(247,230,193,.05)] p-4">
          <p className="text-sm font-bold text-[var(--hm-primary)]">
            아직 이메일 인증이 완료되지 않았어요
          </p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--hm-subtext)]">
            메일함(스팸함 포함)에서 인증 메일을 확인해 주세요. 메일이 없다면 아래
            버튼으로 다시 받을 수 있습니다.
          </p>
          <div className="mt-3">
            <ResendVerificationForm defaultEmail={state.email} hideLabel />
          </div>
        </div>
      ) : null}
    </form>
  );
}

export function ResendVerificationForm({
  defaultEmail,
  hideLabel = false,
}: {
  defaultEmail?: string;
  hideLabel?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <Field label={hideLabel ? "" : "가입 이메일"}>
        <Input
          name="email"
          type="email"
          placeholder="member@example.com"
          defaultValue={defaultEmail}
          required
          disabled={isPending}
        />
      </Field>
      <SubmitButton
        pending={isPending}
        label="인증 메일 재발송"
        pendingLabel="발송 중"
        variant="outline"
      />
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function PasswordInput({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  const [visible, setVisible] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const showClear = hasValue && !props.disabled;

  function clearInput() {
    const input = inputRef.current;
    if (!input) return;
    input.value = "";
    setHasValue(false);
    input.focus();
  }

  return (
    <span className="relative block">
      <Input
        {...props}
        ref={inputRef}
        type={visible ? "text" : "password"}
        clearable={false}
        className={["w-full", showClear ? "pr-20" : "pr-12", className]
          .filter(Boolean)
          .join(" ")}
        onInput={(event) => {
          setHasValue(event.currentTarget.value.length > 0);
          props.onInput?.(event);
        }}
      />
      {showClear ? (
        <button
          type="button"
          onClick={clearInput}
          aria-label="입력 내용 지우기"
          className="hm-link-focus absolute right-12 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--hm-subtext)] transition hover:bg-white/[0.07] hover:text-[var(--hm-primary)]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="hm-link-focus absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--hm-subtext)] transition hover:bg-white/[0.05] hover:text-[var(--hm-primary)] disabled:pointer-events-none disabled:opacity-50"
        disabled={props.disabled}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </span>
  );
}

function SubmitButton({
  pending,
  label,
  pendingLabel,
  variant = "primary",
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
  variant?: "primary" | "outline";
}) {
  // 스피너는 공용 Button이 제출 중에 자동으로 하나만 붙인다.
  return (
    <Button type="submit" className="w-full" variant={variant} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={
        ok ? "text-sm text-emerald-200" : "text-sm text-[#f0a39b]"
      }
      aria-live="polite"
    >
      {message}
    </p>
  );
}
