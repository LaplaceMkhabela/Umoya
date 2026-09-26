import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BASE_SEPOLIA_CHAIN_ID, isFactoryWired } from "@/lib/contracts";
import { demoChain } from "@/lib/wagmi";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Umoya · Stage 1 — Foundation
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight">
        Save together. Grow together.
      </h1>
      <p className="text-sm text-gray-600">
        Non-custodial group pool with proportional shares. Demo network:{" "}
        {demoChain.name} ({BASE_SEPOLIA_CHAIN_ID}).
      </p>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <ConnectButton showBalance={false} />
        <p className="mt-2 text-xs text-gray-500">
          Stage 1 exit: wallet connects to Base Sepolia. Contract reads/writes
          land in Stages 2–3.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold">Contract wiring</h2>
        <p className="mt-1 text-sm">
          PoolFactory:{" "}
          <span
            className={isFactoryWired ? "text-green-600" : "text-amber-600"}
          >
            {isFactoryWired ? "wired" : "not deployed yet (expected in Stage 1)"}
          </span>
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold">UI prototype</h2>
        <p className="mt-1 text-sm text-gray-600">
          Interactive mock (5 tabs, sheets, streaks) lives at{" "}
          <code>docs/index.html</code> — Stage 3 ports it to live reads/writes.
        </p>
      </div>
    </main>
  );
}
