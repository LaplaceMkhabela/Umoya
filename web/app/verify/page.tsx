"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/Auth";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"busy" | "ok" | "bad">("busy");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setState("bad");
      return;
    }
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean; email?: string };
        if (res.ok && data.ok) {
          setEmail(data.email ?? "");
          setState("ok");
        } else {
          setState("bad");
        }
      })
      .catch(() => setState("bad"));
  }, [token]);

  if (state === "busy")
    return <AuthCard title="Verifying…" subtitle="Confirming your email address." ><></></AuthCard>;
  if (state === "ok")
    return (
      <AuthCard title="Email verified" subtitle={email ? `${email} is confirmed.` : "Confirmed."}>
        <Link href="/sign-in" className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white">
          Sign in
        </Link>
      </AuthCard>
    );
  return (
    <AuthCard title="Link invalid" subtitle="This verification link is invalid or expired.">
      <Link href="/sign-up" className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white">
        Back to sign up
      </Link>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<AuthCard title="Verifying…" subtitle="One moment."><></></AuthCard>}>
      <VerifyInner />
    </Suspense>
  );
}
