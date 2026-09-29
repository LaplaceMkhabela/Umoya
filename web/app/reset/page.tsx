"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard, Field } from "@/components/Auth";
import { useToast } from "@/components/Toast";

function ResetInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast(data.error ?? "Reset failed");
        return;
      }
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Link invalid" subtitle="This reset link is missing its token.">
        <Link href="/forgot" className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white">
          Request a new one
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="Sign in with the new password.">
        <Link href="/sign-in" className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white">
          Sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" subtitle="Minimum 8 characters.">
      <Field label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy ? "Updating…" : "Update password"}
      </button>
    </AuthCard>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<AuthCard title="Loading…" subtitle="One moment."><></></AuthCard>}>
      <ResetInner />
    </Suspense>
  );
}
