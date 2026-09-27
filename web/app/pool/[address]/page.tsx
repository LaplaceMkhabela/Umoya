"use client";

import { useState } from "react";
import Link from "next/link";
import { DepositSheet, WithdrawSheet } from "@/components/Sheets";
import { fmtEth, fmtZarEst, shortAddress } from "@/lib/format";
import { useActivity, usePoolSummary, type HexAddress } from "@/lib/hooks";

export default function PoolPage({ params }: { params: { address: string } }) {
  const pool = params.address as HexAddress;
  const [nonce, setNonce] = useState(0);
  const [sheet, setSheet] = useState<"deposit" | "withdraw" | null>(null);
  const s = usePoolSummary(pool);
  const { events } = useActivity(pool, [pool], nonce);
  const myValue =
    s.totalShares && s.totalShares > 0n && s.userShares !== undefined && s.totalValue !== undefined
      ? (s.userShares * s.totalValue) / s.totalShares
      : 0n;

  const refresh = () => {
    setNonce((n) => n + 1);
    s.refetch();
  };

  return (
    <main className="flex flex-col gap-4">
      <Link href="/stokvels" className="text-sm font-semibold text-gray-500">‹ Stokvels</Link>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{s.name ?? shortAddress(pool)}</h1>
        <p className="font-mono text-xs text-gray-500">{pool}</p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="text-xs font-bold uppercase text-gray-500">Pool value</div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight">
          {fmtEth(s.totalValue)} <span className="text-lg text-gray-400">ETH</span>
        </div>
        <div className="text-sm text-gray-500">
          ≈ {fmtZarEst(s.totalValue)} (est.) · {s.memberCount?.toString() ?? "…"} members
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="text-xs font-bold uppercase text-gray-500">Your share</div>
        <div className="mt-1 text-3xl font-extrabold tracking-tight">
          {fmtEth(myValue)} <span className="text-base text-gray-400">ETH</span>
        </div>
        <div className="text-sm text-gray-500">
          {fmtEth(s.userShares)} shares · {s.ownershipBps.toFixed(2)}% ownership
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setSheet("deposit")} className="flex-1 rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white">
          + Add ETH
        </button>
        <button onClick={() => setSheet("withdraw")} className="flex-1 rounded-2xl bg-white p-4 text-sm font-bold shadow-sm">
          ↓ Withdraw
        </button>
      </div>

      <div>
        <h2 className="mb-2 px-1 text-lg font-extrabold">Pool activity</h2>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {events.map((e) => (
            <div key={e.key} className="flex items-center gap-3 border-b border-gray-100 p-4 last:border-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                {e.kind === "deposit" ? "↓" : e.kind === "withdraw" ? "↑" : "＋"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {e.kind === "deposit" ? "Deposit" : e.kind === "withdraw" ? "Withdrawal" : "New member"}
                </div>
                <div className="font-mono text-xs text-gray-500">
                  {e.member ? shortAddress(e.member) : ""} · {e.txHash.slice(0, 10)}…
                </div>
              </div>
              <div className="text-sm font-bold">
                {e.value !== undefined ? `${fmtEth(e.value)} ETH` : ""}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="p-4 text-sm text-gray-500">No on-chain activity yet.</div>
          )}
        </div>
      </div>

      {sheet === "deposit" && (
        <DepositSheet pool={pool} onClose={() => setSheet(null)} onDone={() => { setSheet(null); refresh(); }} />
      )}
      {sheet === "withdraw" && (
        <WithdrawSheet pool={pool} onClose={() => setSheet(null)} onDone={() => { setSheet(null); refresh(); }} />
      )}
    </main>
  );
}
