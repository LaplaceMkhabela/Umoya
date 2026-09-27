"use client";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { ReactNode } from "react";

// Auth is optional until keys are added (see web/.env.example).
// Without keys the app runs wallet-only; with keys, full Clerk flows apply.
export const isAuthConfigured =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "").startsWith("pk_");

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isAuthConfigured) return <>{children}</>;
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}

/** Sign-in button when signed out, avatar menu when signed in. */
export function AuthButton() {
  if (!isAuthConfigured) {
    return (
      <span
        title="Add Clerk keys (web/.env.example) to enable email login"
        className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-gray-400"
      >
        Sign in (setup needed)
      </span>
    );
  }
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}

export function AuthSetupNotice({ feature }: { feature: string }) {
  return (
    <main className="flex flex-col gap-3 rounded-3xl bg-white p-6 text-center shadow-sm">
      <h1 className="text-xl font-extrabold">{feature} unavailable</h1>
      <p className="text-sm text-gray-500">
        Email login is powered by Clerk (free tier: registration, email
        verification, password reset included). Add keys to enable it:
      </p>
      <pre className="overflow-x-auto rounded-2xl bg-gray-900 p-4 text-left font-mono text-xs text-green-300">
        {`# web/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
      </pre>
      <p className="text-xs text-gray-400">
        Get keys at dashboard.clerk.com → restart `npm run dev`.
      </p>
    </main>
  );
}
