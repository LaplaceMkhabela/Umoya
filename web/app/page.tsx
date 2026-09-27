"use client";

import Link from "next/link";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { DepositSheet, WithdrawSheet } from "@/components/Sheets";
import { AuthButton } from "@/components/Auth";
import { useToast } from "@/components/Toast";
import {
  SUPPORTED_CHAIN_IDS,
  isFactoryWired,
} from "@/lib/contracts";
import { fmtEth, fmtZarEst } from "@/lib/format";
import { useActivity, usePoolAddresses, usePoolSummary } from "@/lib/hooks";

export default function Home() {
  const { address, chainId, isConnected } = useAccount();
  const toast = useToast();
  const { pools, refetch: refetchPools } = usePoolAddresses();
  const [nonce, setNonce] = useState(0);
  const [sheet, setSheet] = useState<"deposit" | "withdraw" | null>(null);

  const focus = pools.length > 0 ? pools[0] : undefined;
  const summary = usePoolSummary(focus);
  const myValue =
    summary.totalShares && summary.totalShares > 0n && summary.userShares !== undefined && summary.totalValue !== undefined
      ? (summary.userShares * summary.totalValue) / summary.totalShares
      : 0n;
  const { events } = useActivity(undefined, pools, nonce);
  const wrongNetwork =
    isConnected && chainId !== undefined && !(SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);

  const refresh = () => {
    setNonce((n) => n + 1);
    summary.refetch();
    refetchPools();
  };

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {address ? "Sawubona" : "Umoya"}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">Your stokvels</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ConnectButton showBalance={false} />
          <AuthButton />
        </div>
      </div>

      {wrongNetwork && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Switch your wallet to Localhost (31337) or Base Sepolia to use Umoya.
        </div>
      )}
      {!isFactoryWired && (
        <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          No pool factory configured. Set NEXT_PUBLIC_POOL_FACTORY.
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-gray-500">Your position</span>
          <span className="text-xs font-bold text-umoya">
            {summary.ownershipBps !== undefined ? `${summary.ownershipBps.toFixed(1)}% of pool` : ""}
          </span>
        </div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight">
          {fmtEth(myValue)} <span className="text-lg text-gray-400">ETH</span>
        </div>
        <div className="text-sm text-gray-500">
          ≈ {fmtZarEst(myValue)} (est.) · {summary.name ?? "…"}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-umoya" style={{ width: `${Math.min(100, summary.ownershipBps ?? 0)}%` }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => (focus ? setSheet("deposit") : toast("No pool yet — create one first"))}
          className="flex-1 rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white"
        >
          + Contribute
        </button>
        <button
          onClick={() => (focus ? setSheet("withdraw") : toast("No pool yet — create one first"))}
          className="flex-1 rounded-2xl bg-white p-4 text-sm font-bold shadow-sm"
        >
          ↓ Withdraw
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between px-1">
          <h2 className="text-lg font-extrabold">Stokvels</h2>
          <Link href="/stokvels" className="text-sm font-medium text-gray-500">See all</Link>
        </div>
        {pools.map((p: `0x${string}`) => (
          <PoolRow key={p} pool={p} />
        ))}
        {pools.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
            No pools yet.{" "}
            <Link href="/stokvels" className="font-bold text-umoya">Create the first one →</Link>
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 px-1">
          <h2 className="text-lg font-extrabold">Recent activity</h2>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {events.slice(0, 4).map((e) => (
            <div key={e.key} className="flex items-center gap-3 border-b border-gray-100 p-4 last:border-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                {e.kind === "deposit" ? "↓" : e.kind === "withdraw" ? "↑" : "＋"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {e.kind === "deposit" ? "Deposit" : e.kind === "withdraw" ? "Withdrawal" : "New member"}
                </div>
                <div className="font-mono text-xs text-gray-500">{e.txHash.slice(0, 10)}…</div>
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

      {sheet === "deposit" && focus && (
        <DepositSheet pool={focus} onClose={() => setSheet(null)} onDone={() => { setSheet(null); refresh(); }} />
      )}
      {sheet === "withdraw" && focus && (
        <WithdrawSheet pool={focus} onClose={() => setSheet(null)} onDone={() => { setSheet(null); refresh(); }} />
      )}
    </main>
  );
}

function PoolRow({ pool }: { pool: `0x${string}` }) {
  const s = usePoolSummary(pool);
  return (
    <Link href={`/pool/${pool}`} className="mb-2 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-white">
        {(s.name ?? "?").slice(0, 1)}
      </div>
      <div className="flex-1">
        <div className="font-bold">{s.name ?? "…"}</div>
        <div className="text-xs text-gray-500">
          {s.memberCount !== undefined ? `${s.memberCount.toString()} members` : "…"} ·{" "}
          {s.totalValue !== undefined ? `${fmtEth(s.totalValue)} ETH` : "…"}
        </div>
      </div>
      <span className="text-gray-300">›</span>
    </Link>
  );
}
