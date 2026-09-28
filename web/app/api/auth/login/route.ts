import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail } from "@/lib/auth/db";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/util";

export async function POST(req: NextRequest) {
  if (!checkRateLimit(req, "login"))
    return NextResponse.json({ error: "Too many attempts. Try again soon." }, { status: 429 });
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const clean = (email ?? "").trim().toLowerCase();
  const user = findUserByEmail(clean);
  // Generic error either way: no account enumeration, no oracle on verification state.
  const fail = () =>
    NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  if (!user || !(await verifyPassword(password ?? "", user.password_hash))) {
    // Equalize timing a little so misses aren't measurably faster.
    await verifyPassword("timing-noise", "$2b$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    return fail();
  }
  if (user.email_verified === 0) {
    return NextResponse.json(
      { error: "Email not verified yet.", code: "UNVERIFIED" },
      { status: 403 },
    );
  }
  const token = await createSessionToken({ id: user.id, email: user.email });
  cookies().set(SESSION_COOKIE, token, sessionCookieOptions());
  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, email_verified: true },
  });
}
