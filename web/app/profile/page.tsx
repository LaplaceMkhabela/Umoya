"use client";

import { useAccount } from "wagmi";
import { AuthButton } from "@/components/Auth";
import { fmtEth, shortAddress } from "@/lib/format";
import { useActivity, usePoolAddresses, usePoolSummary, type HexAddress } from "@/lib/hooks";

export default function ProfilePage() {
  const { address } = useAccount();
  const { pools } = usePoolAddresses();
  const { events } = useActivity(undefined, pools);
  const myDeposits = address
    ? events.filter(
        (e) => e.kind === "deposit" && e.member?.toLowerCase() === address.toLowerCase(),
      )
    : [];
  const joinedPools = new Set(
    events
      .filter(
        (e) =>
          e.kind === "join" &&
          address &&
          e.member?.toLowerCase() === address.toLowerCase(),
      )
      .map((e) => e.pool),
  );
  const totalContributed = myDeposits.reduce((sum, e) => sum + (e.value ?? 0n), 0n);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">My Profile</h1>
        <AuthButton />
      </div>
      <div className="rounded-3xl bg-amber-50 p-4">
        <div className="text-xl font-extrabold text-amber-900">
          {joinedPools.size} {joinedPools.size === 1 ? "stokvel" : "stokvels"} joined
        </div>
        <div className="text-sm font-semibold text-amber-700">
          {fmtEth(totalContributed)} ETH contributed on-chain
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-lg font-bold">
            {address ? address.slice(2, 3).toUpperCase() : "?"}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">Account</div>
            <div className="font-mono text-xs text-gray-500">
              {address ? shortAddress(address) : "Not connected"}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="mb-2 px-1 text-lg font-extrabold">Positions</h2>
        {pools.map((p: HexAddress) => (
          <PositionRow key={p} pool={p} />
        ))}
        {pools.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-sm">
            No pools on this network yet.
          </div>
        )}
      </div>
    </main>
  );
}

function PositionRow({ pool }: { pool: HexAddress }) {
  const s = usePoolSummary(pool);
  if (!s.userShares || s.userShares === 0n) return null;
  return (
    <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="text-sm font-bold">{s.name ?? shortAddress(pool)}</div>
        <div className="text-xs text-gray-500">
          {fmtEth(s.userShares)} shares · {s.ownershipBps.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
