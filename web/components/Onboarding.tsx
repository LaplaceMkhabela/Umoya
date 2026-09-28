"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthConfigured } from "./Auth";

const SEEN_KEY = "umoya-onboarded-v1";

const SLIDES = [
  {
    icon: "◉",
    title: "Save together",
    body: "Stokvel pools live in smart contracts. Every contribution is transparent and every share is yours on-chain.",
  },
  {
    icon: "▲",
    title: "Grow together",
    body: "Pooled capital is deployed into established DeFi yield strategies, so the whole group earns while it saves.",
  },
  {
    icon: "⬣",
    title: "Own it on-chain",
    body: "Ownership is proportional to your shares. Withdraw your slice anytime — no organizer, no spreadsheet.",
  },
];

export function Onboarding() {
  const [phase, setPhase] = useState<"check" | "splash" | "slides" | "done">("check");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(SEEN_KEY);
    } catch {
      stored = null;
    }
    if (stored) {
      setPhase("done");
    } else {
      setPhase("splash");
      const t = window.setTimeout(() => setPhase("slides"), 1400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const finish = () => {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode: show again next visit */
    }
    setPhase("done");
  };

  if (phase === "check" || phase === "done") return null;

  if (phase === "splash") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="text-5xl font-extrabold tracking-tight">
          Umoya<span className="text-umoya">.</span>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-400">
          Save together. Grow together.
        </p>
        <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-gray-700">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-umoya" />
        </div>
      </div>
    );
  }

  const last = slide === SLIDES.length - 1;
  const s = SLIDES[slide];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-50">
      <div className="flex justify-end p-4">
        <button onClick={finish} className="text-sm font-bold text-gray-400">
          Skip
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-900 text-4xl text-umoya">
          {s.icon}
        </div>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">{s.title}</h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">{s.body}</p>
        <div className="mt-6 flex gap-2">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full ${i === slide ? "w-6 bg-umoya" : "w-2 bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-6">
        {last ? (
          <>
            <Link
              href="/sign-up"
              onClick={finish}
              className="w-full rounded-2xl bg-gray-900 p-4 text-center text-sm font-bold text-white"
            >
              Create account{isAuthConfigured ? "" : " (setup needed)"}
            </Link>
            <Link
              href="/sign-in"
              onClick={finish}
              className="w-full rounded-2xl bg-white p-4 text-center text-sm font-bold shadow-sm"
            >
              Sign in
            </Link>
            <button onClick={finish} className="p-2 text-sm font-semibold text-gray-500">
              Continue with wallet only →
            </button>
          </>
        ) : (
          <button
            onClick={() => setSlide((v) => v + 1)}
            className="w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
