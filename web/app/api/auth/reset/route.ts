import { NextRequest, NextResponse } from "next/server";
import {
  consumeToken,
  findUserById,
  invalidateUserTokens,
  updatePassword,
} from "@/lib/auth/db";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { checkRateLimit, tokenHash } from "@/lib/auth/util";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "reset"))
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  const { token, password } = (await req.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const passErr = validatePassword(password ?? "");
  if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });
  // Consume first (single-use), then apply — replaying the token is useless either way.
  const user = consumeToken(tokenHash(token), "reset");
  if (!user || !findUserById(user.id))
    return NextResponse.json({ error: "Link is invalid or expired." }, { status: 400 });
  await updatePassword(user.id, await hashPassword(password!));
  invalidateUserTokens(user.id, "reset");
  return NextResponse.json({ ok: true, message: "Password updated. Sign in with the new one." });
}
