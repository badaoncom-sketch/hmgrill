"use client";

import { useActionState } from "react";
import {
  loginAction,
  requestPasswordResetAction,
  resendVerificationAction,
  signupAction,
  updatePasswordAction,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

const initialState = {
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
        <Input name="email" type="email" placeholder="member@example.com" required />
      </Field>
      <Field label="비밀번호">
        <Input name="password" minLength={8} type="password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "처리 중" : "회원가입"}
      </Button>
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
        <Input name="email" type="email" placeholder="member@example.com" required />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "발송 중" : "비밀번호 재설정 메일 받기"}
      </Button>
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
        <Input name="password" minLength={8} type="password" required />
      </Field>
      <Field label="새 비밀번호 확인">
        <Input name="passwordConfirm" minLength={8} type="password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "변경 중" : "비밀번호 변경"}
      </Button>
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="이메일">
        <Input name="email" type="email" placeholder="member@example.com" required />
      </Field>
      <Field label="비밀번호">
        <Input name="password" type="password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "처리 중" : "로그인"}
      </Button>
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

export function ResendVerificationForm() {
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <Field label="인증 메일 재발송">
        <Input name="email" type="email" placeholder="member@example.com" required />
      </Field>
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "발송 중" : "재발송"}
      </Button>
      <ActionMessage ok={state.ok} message={state.message} />
    </form>
  );
}

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className={ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>
      {message}
    </p>
  );
}
