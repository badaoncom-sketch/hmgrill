import { NextResponse } from "next/server";
import { createAndSendVerificationEmail } from "@/lib/auth/verification";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    name?: string;
    userId?: string;
  };

  if (!body.email || !body.name || !body.userId) {
    return NextResponse.json(
      { error: "email, name, userId are required." },
      { status: 400 },
    );
  }

  try {
    const id = await createAndSendVerificationEmail({
      userId: body.userId,
      email: body.email,
      name: body.name,
    });

    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Verification email failed.",
      },
      { status: 502 },
    );
  }
}
