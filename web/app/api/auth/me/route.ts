import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById, toSafeUser } from "@/lib/auth/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });
  const claims = await verifySessionToken(token);
  if (!claims) return NextResponse.json({ user: null });
  const user = findUserById(claims.id);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: toSafeUser(user) });
}
