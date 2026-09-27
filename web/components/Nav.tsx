"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today", icon: "⌂" },
  { href: "/stokvels", label: "Stokvels", icon: "◉" },
  { href: "/transfer", label: "Transfer", icon: "⇄" },
  { href: "/activity", label: "Activity", icon: "◷" },
  { href: "/profile", label: "Profile", icon: "○" },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-around rounded-full border border-white/60 bg-white/95 px-2 py-2 shadow-xl backdrop-blur">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex w-14 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold ${
              active ? "text-umoya" : "text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
