"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, Field } from "@/components/Auth";
import { useToast } from "@/components/Toast";

export default function SignUpPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ message: string; previewUrl?: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        previewUrl?: string;
      };
      if (!res.ok) {
        toast(data.error ?? "Registration failed");
        return;
      }
      setDone({ message: data.message ?? "Account created.", previewUrl: data.previewUrl });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthCard title="Check your email" subtitle={done.message}>
        {done.previewUrl && (
          <a
            href={done.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-gray-100 p-4 text-center text-xs font-bold text-gray-700"
          >
            Open dev inbox preview ↗
          </a>
        )}
        <Link href="/sign-in" className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white">
          Go to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create account" subtitle="One account for Umoya. Passwords are bcrypt-hashed; never stored plain.">
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Field label="Password (min 8 characters)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-xs font-semibold text-gray-500">
        Already have an account? <Link href="/sign-in" className="text-umoya">Sign in</Link>
      </p>
    </AuthCard>
  );
}
