// Custom auth service: SQLite-backed users + single-use email tokens.
// DB file lives in web/.data (gitignored). WAL mode for dev-server concurrency.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const DB_PATH =
  process.env.AUTH_DB_PATH ?? join(process.cwd(), ".data", "umoya.db");

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS auth_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_tokens_hash ON auth_tokens(token_hash);
`);

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  email_verified: number;
  created_at: number;
};

export type SafeUser = { id: string; email: string; email_verified: boolean };

export function toSafeUser(u: UserRow): SafeUser {
  return { id: u.id, email: u.email, email_verified: u.email_verified === 1 };
}

export function findUserByEmail(email: string): UserRow | null {
  return (
    (db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase()) as UserRow | undefined) ?? null
  );
}

export function findUserById(id: string): UserRow | null {
  return (
    (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | UserRow
      | undefined) ?? null
  );
}

export function createUser(email: string, passwordHash: string): UserRow {
  const now = Date.now();
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO users (id, email, password_hash, email_verified, created_at) VALUES (?, ?, ?, 0, ?)",
  ).run(id, email.toLowerCase(), passwordHash, now);
  return findUserById(id) as UserRow;
}

export function markEmailVerified(userId: string): void {
  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(userId);
}

export function updatePassword(userId: string, passwordHash: string): void {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    userId,
  );
}

export function createToken(
  userId: string,
  type: "verify" | "reset",
  tokenHash: string,
  expiresAt: number,
): void {
  db.prepare(
    "INSERT INTO auth_tokens (id, user_id, type, token_hash, expires_at, used, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)",
  ).run(crypto.randomUUID(), userId, type, tokenHash, expiresAt, Date.now());
}

/** Atomically consume a single-use token; returns the user or null. */
export function consumeToken(
  tokenHash: string,
  type: "verify" | "reset",
): UserRow | null {
  const row = db
    .prepare(
      "SELECT user_id, expires_at, used FROM auth_tokens WHERE token_hash = ? AND type = ?",
    )
    .get(tokenHash, type) as
    | { user_id: string; expires_at: number; used: number }
    | undefined;
  if (!row || row.used !== 0 || row.expires_at < Date.now()) return null;
  db.prepare("UPDATE auth_tokens SET used = 1 WHERE token_hash = ?").run(
    tokenHash,
  );
  return findUserById(row.user_id);
}

/** Invalidate all of a user's tokens of a type (e.g. after password change). */
export function invalidateUserTokens(
  userId: string,
  type: "verify" | "reset",
): void {
  db.prepare("UPDATE auth_tokens SET used = 1 WHERE user_id = ? AND type = ?").run(
    userId,
    type,
  );
}
