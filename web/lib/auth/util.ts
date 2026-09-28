import { NextRequest } from "next/server";
import { createHash, randomBytes } from "node:crypto";

// Tiny in-memory rate limiter for auth endpoints (per process).
// Production with multiple instances would use Redis; fine for this service size.
const WINDOW_MS = 60_000;
const MAX_HITS = 20;

const hits = new Map<string, { count: number; reset: number }>();

export function checkRateLimit(req: NextRequest, scope: string): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_HITS;
}

export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}
