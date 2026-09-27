"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreatePoolSheet } from "@/components/Sheets";
import { fmtEth } from "@/lib/format";
import { usePoolAddresses, usePoolSummary, type HexAddress } from "@/lib/hooks";

export default function StokvelsPage() {
  const { pools, refetch } = usePoolAddresses();
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">My Stokvels</h1>
        <button onClick={() => setCreating(true)} className="text-sm font-bold text-umoya">
          + New
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <span className="text-gray-400">⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pools…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        {pools.map((p: HexAddress) => (
          <FilterableRow key={p} pool={p} query={q} />
        ))}
        {pools.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No pools on this network yet — create the first stokvel.
          </div>
        )}
      </div>
      {creating && (
        <CreatePoolSheet
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            refetch();
          }}
        />
      )}
    </main>
  );
}

function FilterableRow({ pool, query }: { pool: HexAddress; query: string }) {
  const s = usePoolSummary(pool);
  const visible = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return true;
    return (s.name ?? "").toLowerCase().includes(needle) || pool.toLowerCase().includes(needle);
  }, [query, s.name, pool]);
  if (!visible) return null;
  return (
    <Link href={`/pool/${pool}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-white">
        {(s.name ?? "?").slice(0, 1)}
      </div>
      <div className="flex-1">
        <div className="font-bold">{s.name ?? `${pool.slice(0, 6)}…${pool.slice(-4)}`}</div>
        <div className="text-xs text-gray-500">
          {s.memberCount !== undefined ? `${s.memberCount.toString()} members` : "…"} ·{" "}
          {s.totalValue !== undefined ? `${fmtEth(s.totalValue)} ETH pooled` : "…"}
        </div>
      </div>
      <span className="text-gray-300">›</span>
    </Link>
  );
}
