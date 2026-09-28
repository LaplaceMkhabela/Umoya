import { NextRequest, NextResponse } from "next/server";
import {
  consumeToken,
  createToken,
  findUserByEmail,
  invalidateUserTokens,
  markEmailVerified,
} from "@/lib/auth/db";
import { sendVerificationEmail } from "@/lib/auth/email";
import { checkRateLimit, newToken, tokenHash } from "@/lib/auth/util";

export async function GET(req: NextRequest) {
  if (!checkRateLimit(req, "verify"))
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const user = consumeToken(tokenHash(token), "verify");
  if (!user)
    return NextResponse.json({ error: "Link is invalid or expired." }, { status: 400 });
  markEmailVerified(user.id);
  invalidateUserTokens(user.id, "verify");
  return NextResponse.json({ ok: true, email: user.email });
}

export async function POST(req: NextRequest) {
  // Resend verification: { email }
  if (!checkRateLimit(req, "resend"))
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const clean = (email ?? "").trim().toLowerCase();
  const user = findUserByEmail(clean);
  // Always respond ok (no account enumeration); only verified=false users get mail.
  if (user && user.email_verified === 0) {
    const token = newToken();
    createToken(user.id, "verify", tokenHash(token), Date.now() + 24 * 3600_000);
    await sendVerificationEmail(clean, token).catch(() => ({}));
  }
  return NextResponse.json({ ok: true });
}
