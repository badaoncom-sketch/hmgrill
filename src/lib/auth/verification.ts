import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { renderVerificationEmail } from "@/emails/verification-email";
import { createAdminClient } from "@/lib/supabase/admin";

const verificationTokenTtlHours = 24;

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createVerificationToken() {
  return randomBytes(32).toString("base64url");
}

export async function createAndSendVerificationEmail({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!resendApiKey || !emailFrom) {
    throw new Error("Resend environment variables are required.");
  }

  const token = createVerificationToken();
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(
    Date.now() + verificationTokenTtlHours * 60 * 60 * 1000,
  ).toISOString();
  const supabase = createAdminClient();

  await supabase
    .from("email_verification_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null);

  const { error: insertError } = await supabase
    .from("email_verification_tokens")
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

  if (insertError) {
    throw insertError;
  }

  const verificationUrl = `${siteUrl}/auth/verify?token=${encodeURIComponent(
    token,
  )}`;
  const resend = new Resend(resendApiKey);
  const { html, text } = renderVerificationEmail({ name, verificationUrl });
  const result = await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: "화목 이메일 인증을 완료해 주세요",
    html,
    text,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data?.id;
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashVerificationToken(token);
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: verification, error } = await supabase
    .from("email_verification_tokens")
    .select("id,user_id,expires_at,used_at")
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!verification) {
    return { ok: false, message: "유효하지 않은 인증 링크입니다." };
  }

  if (verification.expires_at < now) {
    return { ok: false, message: "인증 링크가 만료되었습니다." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ email_verified: true, updated_at: now })
    .eq("id", verification.user_id);

  if (profileError) {
    throw profileError;
  }

  const { error: userError } = await supabase.auth.admin.updateUserById(
    verification.user_id,
    {
      email_confirm: true,
    },
  );

  if (userError) {
    throw userError;
  }

  const { error: tokenError } = await supabase
    .from("email_verification_tokens")
    .update({ used_at: now })
    .eq("id", verification.id);

  if (tokenError) {
    throw tokenError;
  }

  return { ok: true, message: "이메일 인증이 완료되었습니다." };
}
