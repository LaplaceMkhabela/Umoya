"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type SessionUser = {
  id: string;
  email: string;
  email_verified: boolean;
} | null;

// Custom auth service (lib/auth/* + /api/auth/*). Always available —
// no third-party account needed.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser | undefined>(undefined);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: SessionUser };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { user, refresh };
}

export function AuthButton() {
  const { user } = useSessionUser();
  const router = useRouter();
  if (user === undefined) {
    return <span className="text-xs text-gray-300">…</span>;
  }
  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white"
      >
        Sign in
      </Link>
    );
  }
  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    window.location.reload();
  };
  return (
    <div className="flex items-center gap-2">
      <span
        title={user.email}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white"
      >
        {user.email.slice(0, 1).toUpperCase()}
      </span>
      <button onClick={signOut} className="text-xs font-bold text-gray-400">
        Sign out
      </button>
    </div>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      {children}
    </main>
  );
}

export function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-500">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold outline-none focus:border-gray-400"
      />
    </label>
  );
}
