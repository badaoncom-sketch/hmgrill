import { NextResponse } from "next/server";
import { Resend } from "resend";
import { VerificationEmail } from "@/emails/verification-email";

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!resendApiKey || !emailFrom) {
    return NextResponse.json(
      { error: "Email environment variables are not configured." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as {
    email?: string;
    name?: string;
    token?: string;
  };

  if (!body.email || !body.name || !body.token) {
    return NextResponse.json(
      { error: "email, name, token are required." },
      { status: 400 },
    );
  }

  const resend = new Resend(resendApiKey);
  const verificationUrl = `${siteUrl}/auth/verify?token=${encodeURIComponent(
    body.token,
  )}`;

  const result = await resend.emails.send({
    from: emailFrom,
    to: body.email,
    subject: "화목 이메일 인증을 완료해 주세요",
    react: VerificationEmail({
      name: body.name,
      verificationUrl,
    }),
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 502 });
  }

  return NextResponse.json({ id: result.data?.id });
}
