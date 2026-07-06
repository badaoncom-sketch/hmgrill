"use server";

import { redirect } from "next/navigation";
import { createAndSendVerificationEmail } from "@/lib/auth/verification";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AuthActionState = {
  ok: boolean;
  message: string;
};

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email").toLowerCase();
  const password = readRequiredString(formData, "password");

  if (!email || password.length < 8) {
    return {
      ok: false,
      message: "이메일과 8자 이상 비밀번호를 입력해 주세요.",
    };
  }

  const admin = createAdminClient();
  const { data: createdUser, error: createUserError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {},
      app_metadata: { role: "member" },
    });

  if (createUserError || !createdUser.user) {
    return {
      ok: false,
      message: createUserError?.message ?? "회원가입에 실패했습니다.",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: createdUser.user.id,
    role: "member",
    email,
    email_verified: false,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);

    return {
      ok: false,
      message: profileError.message,
    };
  }

  try {
    await createAndSendVerificationEmail({
      userId: createdUser.user.id,
      email,
      name: email,
    });
  } catch (error) {
    await admin.auth.admin.deleteUser(createdUser.user.id);

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "인증 메일 발송에 실패했습니다.",
    };
  }

  return {
    ok: true,
    message: "회원가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.",
  };
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email").toLowerCase();

  if (!email) {
    return { ok: false, message: "이메일을 입력해 주세요." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: "가입 정보가 있으면 비밀번호 재설정 메일을 발송합니다.",
  };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readRequiredString(formData, "password");
  const passwordConfirm = readRequiredString(formData, "passwordConfirm");

  if (password.length < 8 || password !== passwordConfirm) {
    return {
      ok: false,
      message: "8자 이상 비밀번호를 동일하게 입력해 주세요.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "비밀번호 재설정 링크가 만료되었거나 세션이 없습니다.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, message: error.message };
  }

  await supabase.auth.signOut();

  return {
    ok: true,
    message: "비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.",
  };
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email").toLowerCase();
  const password = readRequiredString(formData, "password");

  if (!email || !password) {
    return { ok: false, message: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      ok: false,
      message: error?.message ?? "로그인에 실패했습니다.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email_verified")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    return { ok: false, message: profileError.message };
  }

  if (!profile?.email_verified) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message: "이메일 인증 후 로그인할 수 있습니다.",
    };
  }

  redirect("/mypage");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resendVerificationAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email").toLowerCase();

  if (!email) {
    return { ok: false, message: "이메일을 입력해 주세요." };
  }

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id,name,email,email_verified")
    .eq("email", email)
    .limit(1);

  if (error) {
    return { ok: false, message: error.message };
  }

  const profile = profiles?.[0];

  if (!profile) {
    return {
      ok: true,
      message: "가입 정보가 있으면 인증 메일을 다시 발송합니다.",
    };
  }

  if (profile.email_verified) {
    return { ok: true, message: "이미 인증이 완료된 이메일입니다." };
  }

  await createAndSendVerificationEmail({
    userId: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email,
  });

  return { ok: true, message: "인증 메일을 다시 발송했습니다." };
}
