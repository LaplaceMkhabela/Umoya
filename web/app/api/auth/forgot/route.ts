import { NextRequest, NextResponse } from "next/server";
import { createToken, findUserByEmail } from "@/lib/auth/db";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { checkRateLimit, newToken, tokenHash } from "@/lib/auth/util";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "forgot"))
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const clean = (email ?? "").trim().toLowerCase();
  const user = findUserByEmail(clean);
  // Always respond ok: never reveal whether an email is registered.
  if (user) {
    const token = newToken();
    createToken(user.id, "reset", tokenHash(token), Date.now() + 3600_000);
    await sendPasswordResetEmail(clean, token).catch(() => ({}));
  }
  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a reset link is on its way.",
  });
}
