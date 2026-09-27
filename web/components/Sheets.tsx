"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { factoryAbi } from "@/lib/abi/factoryAbi";
import { poolAbi } from "@/lib/abi/poolAbi";
import {
  MOCK_STRATEGY_ADDRESS,
  POOL_FACTORY_ADDRESS,
  isFactoryWired,
} from "@/lib/contracts";
import { fmtEth } from "@/lib/format";
import { usePoolSummary, type HexAddress } from "@/lib/hooks";
import { useToast } from "./Toast";

function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-200" />
        <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
        <p className="mb-4 text-sm text-gray-500">{subtitle}</p>
        {children}
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-gray-100 p-4 text-sm font-bold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const QUICK_ETH = ["0.05", "0.1", "0.5", "1"];

function useTxFeedback(onSuccess: (hash: string) => void) {
  const toast = useToast();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  useEffect(() => {
    if (isSuccess && hash) onSuccess(hash);
  }, [isSuccess, hash, onSuccess]);
  useEffect(() => {
    if (error) toast(`Failed: ${error.message.split("\n")[0].slice(0, 90)}`);
  }, [error, toast]);
  return { hash, isPending, confirming, isSuccess, writeContract };
}

export function DepositSheet({
  pool,
  onClose,
  onDone,
}: {
  pool: HexAddress;
  onClose: () => void;
  onDone: () => void;
}) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("0.1");
  const toast = useToast();
  const quote = usePoolSummary(pool);
  let quoteShares = 0n;
  try {
    const v = parseEther(amount || "0");
    if (quote.totalShares !== undefined && quote.totalValue !== undefined) {
      quoteShares =
        quote.totalShares === 0n || quote.totalValue === 0n
          ? v
          : (v * quote.totalShares) / quote.totalValue;
    }
  } catch {
    quoteShares = 0n;
  }
  const tx = useTxFeedback(() => {
    toast(`Deposited ${amount} ETH`);
    onDone();
  });
  const submit = () => {
    if (!address) return toast("Connect a wallet first");
    let v: bigint;
    try {
      v = parseEther(amount);
    } catch {
      return toast("Enter a valid ETH amount");
    }
    if (v <= 0n) return toast("Amount must be positive");
    tx.writeContract({
      address: pool, abi: poolAbi, functionName: "deposit", value: v,
    });
  };
  return (
    <Sheet title="Contribute" subtitle="Funds go directly into the pool contract" onClose={onClose}>
      <div className="rounded-2xl bg-gray-100 p-5 text-center">
        <div className="text-xs font-bold uppercase text-gray-500">Amount in ETH</div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="mt-1 w-full bg-transparent text-center text-4xl font-extrabold outline-none"
        />
        <div className="mt-1 text-xs text-gray-500">≈ {fmtEth(quoteShares)} shares</div>
      </div>
      <div className="my-4 grid grid-cols-4 gap-2">
        {QUICK_ETH.map((q) => (
          <button
            key={q}
            onClick={() => setAmount(q)}
            className={`rounded-xl p-3 text-sm font-bold ${amount === q ? "bg-gray-900 text-white" : "bg-gray-100"}`}
          >
            {q}
          </button>
        ))}
      </div>
      <button
        onClick={submit}
        disabled={tx.isPending || tx.confirming}
        className="mb-2 w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {tx.isPending ? "Confirm in wallet…" : tx.confirming ? "Confirming…" : "Confirm contribution"}
      </button>
    </Sheet>
  );
}

export function WithdrawSheet({
  pool,
  onClose,
  onDone,
}: {
  pool: HexAddress;
  onClose: () => void;
  onDone: () => void;
}) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("0.1");
  const toast = useToast();
  const quote = usePoolSummary(pool);
  const userShares = quote.userShares ?? 0n;
  let sharesToBurn = 0n;
  try {
    const v = parseEther(amount || "0");
    if (quote.totalShares !== undefined && quote.totalValue !== undefined && quote.totalValue > 0n) {
      const raw = (v * quote.totalShares) / quote.totalValue;
      sharesToBurn = raw > userShares ? userShares : raw;
    }
  } catch {
    sharesToBurn = 0n;
  }
  const tx = useTxFeedback(() => {
    toast(`Withdrew ${amount} ETH`);
    onDone();
  });
  const submit = () => {
    if (!address) return toast("Connect a wallet first");
    if (sharesToBurn <= 0n) return toast("Nothing to withdraw");
    tx.writeContract({
      address: pool, abi: poolAbi, functionName: "withdraw", args: [sharesToBurn],
    });
  };
  return (
    <Sheet title="Withdraw" subtitle={`Your shares: ${fmtEth(userShares)}`} onClose={onClose}>
      <div className="rounded-2xl bg-gray-100 p-5 text-center">
        <div className="text-xs font-bold uppercase text-gray-500">Amount in ETH</div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="mt-1 w-full bg-transparent text-center text-4xl font-extrabold outline-none"
        />
        <div className="mt-1 text-xs text-gray-500">≈ {fmtEth(sharesToBurn)} shares</div>
      </div>
      <button
        onClick={submit}
        disabled={tx.isPending || tx.confirming}
        className="mb-2 mt-4 w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {tx.isPending ? "Confirm in wallet…" : tx.confirming ? "Confirming…" : "Confirm withdrawal"}
      </button>
    </Sheet>
  );
}

export function CreatePoolSheet({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const toast = useToast();
  const tx = useTxFeedback(() => {
    toast("Stokvel created — it now appears in the list");
    onDone();
  });
  const submit = () => {
    if (!address) return toast("Connect a wallet first");
    if (!isFactoryWired) return toast("Factory not configured");
    const clean = name.trim() || "My Stokvel";
    tx.writeContract({
      address: POOL_FACTORY_ADDRESS, abi: factoryAbi,
      functionName: "createGroup", args: [clean, MOCK_STRATEGY_ADDRESS],
    });
  };
  return (
    <Sheet title="Create a stokvel" subtitle="Deploys a pool bound to the mock strategy" onClose={onClose}>
      <label className="mb-1 block text-xs font-bold text-gray-500">Pool name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Family Legacy Fund"
        className="mb-4 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold outline-none"
      />
      <div className="mb-4 rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
        Monthly contribution + lock period live in the pool rules (Stage 5).
        v1 pools use simple proportional shares.
      </div>
      <button
        onClick={submit}
        disabled={tx.isPending || tx.confirming}
        className="mb-2 w-full rounded-2xl bg-gray-900 p-4 text-sm font-bold text-white disabled:opacity-50"
      >
        {tx.isPending ? "Confirm in wallet…" : tx.confirming ? "Confirming…" : "Create Stokvel"}
      </button>
    </Sheet>
  );
}
