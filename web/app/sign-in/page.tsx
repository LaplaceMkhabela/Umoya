"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard, Field } from "@/components/Auth";
import { useToast } from "@/components/Toast";

export default function SignInPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [unverified, setUnverified] = useState(false);

  const submit = async () => {
    setBusy(true);
    setUnverified(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; code?: string };
      if (!res.ok) {
        if (data.code === "UNVERIFIED") setUnverified(true);
        toast(data.error ?? "Sign in failed");
        return;
      }
      toast("Welcome back");
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    toast("Verification email re-sent if the account exists");
  };

  return (
    <AuthCard title="Sign in" subtitle="Welcome back to Umoya.">
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      {unverified && (
        <button onClick={resend} className="text-left text-xs font-bold text-umoya">
          Email not verified — re-send verification link
        </button>
      )}
      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex justify-between text-xs font-semibold">
        <Link href="/forgot" className="text-gray-500">Forgot password?</Link>
        <Link href="/sign-up" className="text-umoya">Create account</Link>
      </div>
    </AuthCard>
  );
}
