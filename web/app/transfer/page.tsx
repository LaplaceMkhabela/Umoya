"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { fmtEth, fmtZarEst } from "@/lib/format";

export default function TransferPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Personal Wallet</h1>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="text-xs font-bold uppercase text-gray-500">Available balance</div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight">
          {fmtEth(balance?.value)} <span className="text-lg text-gray-400">ETH</span>
        </div>
        <div className="text-sm text-gray-500">≈ {fmtZarEst(balance?.value)} (est.)</div>
        <div className="mt-4">
          <ConnectButton showBalance={false} />
        </div>
      </div>
      <div className="text-xs font-bold uppercase text-gray-500">Linked accounts (demo)</div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
            ₿
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">Capitec Bank</div>
            <div className="text-xs text-gray-500">Savings ****4921 · not yet linked on-chain</div>
          </div>
        </div>
      </div>
      <p className="px-1 text-xs text-gray-500">
        Bank rails land after the hackathon. On-chain, moving funds means calling{" "}
        <span className="font-mono">deposit()</span> on a pool.
      </p>
    </main>
  );
}
