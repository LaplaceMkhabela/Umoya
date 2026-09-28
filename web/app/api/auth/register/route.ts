import { NextRequest, NextResponse } from "next/server";
import { createUser, createToken, findUserByEmail } from "@/lib/auth/db";
import { sendVerificationEmail } from "@/lib/auth/email";
import { hashPassword, validateEmail, validatePassword } from "@/lib/auth/password";
import { checkRateLimit, newToken, tokenHash } from "@/lib/auth/util";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "register"))
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const emailErr = validateEmail(email ?? "");
  if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });
  const passErr = validatePassword(password ?? "");
  if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });

  const clean = email!.trim().toLowerCase();
  if (findUserByEmail(clean))
    // Don't reveal which emails are registered, but nudge to sign in.
    return NextResponse.json(
      { ok: true, message: "If this email is new, a verification link is on its way." },
      { status: 200 },
    );

  const user = createUser(clean, await hashPassword(password!));
  const token = newToken();
  createToken(user.id, "verify", tokenHash(token), Date.now() + 24 * 3600_000);
  const sent = await sendVerificationEmail(clean, token).catch(() => ({}));
  return NextResponse.json(
    { ok: true, message: "Account created. Check your email to verify.", previewUrl: (sent as { previewUrl?: string }).previewUrl },
    { status: 201 },
  );
}
