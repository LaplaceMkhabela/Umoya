"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, Field } from "@/components/Auth";
import { useToast } from "@/components/Toast";

export default function ForgotPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setBusy(false);
      toast("Request received");
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="If an account exists for that address, a reset link is on its way (expires in 1 hour)."
      >
        <Link href="/sign-in" className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white">
          Back to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot password" subtitle="Enter your account email.">
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </AuthCard>
  );
}
