"use client";

import { fmtEth, shortAddress } from "@/lib/format";
import { useActivity, usePoolAddresses } from "@/lib/hooks";

export default function ActivityPage() {
  const { pools } = usePoolAddresses();
  const { events, isLoading } = useActivity(undefined, pools);

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Smart Contract Logs</h1>
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
                {e.member ? `${shortAddress(e.member)} · ` : ""}
                {shortAddress(e.pool)} · {e.txHash.slice(0, 10)}…
              </div>
            </div>
            <div className="text-sm font-bold">
              {e.value !== undefined ? `${fmtEth(e.value)} ETH` : ""}
            </div>
          </div>
        ))}
        {!isLoading && events.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            No on-chain activity on this network yet.
          </div>
        )}
        {isLoading && events.length === 0 && (
          <div className="p-4 text-sm text-gray-500">Reading logs…</div>
        )}
      </div>
    </main>
  );
}
