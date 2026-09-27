"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { decodeEventLog, parseAbi } from "viem";
import { factoryAbi } from "./abi/factoryAbi";
import { poolAbi } from "./abi/poolAbi";
import {
  POOL_FACTORY_ADDRESS,
  isFactoryWired,
} from "./contracts";

export type HexAddress = `0x${string}`;

/** All pool addresses from the factory. */
export function usePoolAddresses() {
  const result = useReadContract({
    address: POOL_FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "allPools",
    query: { enabled: isFactoryWired },
  });
  return { ...result, pools: (result.data ?? []) as HexAddress[] };
}

/** One pool's accounting + the connected wallet's position. */
export function usePoolSummary(pool: HexAddress | undefined) {
  const { address: account } = useAccount();
  const enabled = Boolean(pool) && isFactoryWired;
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: pool as HexAddress, abi: poolAbi, functionName: "name" },
      { address: pool as HexAddress, abi: poolAbi, functionName: "totalValue" },
      { address: pool as HexAddress, abi: poolAbi, functionName: "totalShares" },
      { address: pool as HexAddress, abi: poolAbi, functionName: "memberCount" },
      {
        address: pool as HexAddress,
        abi: poolAbi,
        functionName: "shares",
        args: [(account ?? "0x0000000000000000000000000000000000000000") as HexAddress],
      },
    ],
    query: { enabled },
  });
  const [name, totalValue, totalShares, memberCount, userShares] = useMemo(() => {
    const get = (i: number) =>
      data?.[i]?.status === "success" ? data[i].result : undefined;
    return [
      get(0) as string | undefined,
      get(1) as bigint | undefined,
      get(2) as bigint | undefined,
      get(3) as bigint | undefined,
      get(4) as bigint | undefined,
    ] as const;
  }, [data]);
  const ownershipBps =
    totalShares && totalShares > 0n && userShares !== undefined
      ? Number((userShares * 10_000n) / totalShares) / 100
      : 0;
  return {
    name, totalValue, totalShares, memberCount, userShares, ownershipBps,
    isLoading, refetch,
  };
}

export type ActivityEvent = {
  key: string;
  kind: "deposit" | "withdraw" | "join" | "created";
  pool: HexAddress;
  member?: string;
  value?: bigint;
  blockNumber: bigint;
  txHash: string;
};

const poolEventsAbi = parseAbi([
  "event Deposited(address indexed member, uint256 value, uint256 sharesMinted)",
  "event Withdrawn(address indexed member, uint256 value, uint256 sharesBurned)",
  "event MemberJoined(address indexed member)",
]);

/** Newest-first on-chain activity. Pass a pool to scope, omit for all pools. */
export function useActivity(pool: HexAddress | undefined, pools: HexAddress[], nonce = 0) {
  const client = usePublicClient();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!client || !isFactoryWired) return;
    const targets = pool ? [pool] : pools;
    if (targets.length === 0) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const perPool = await Promise.all(
          targets.map(async (p) => {
            const logs = await client.getLogs({
              address: p,
              fromBlock: 0n,
              toBlock: "latest",
            });
            const out: ActivityEvent[] = [];
            for (const l of logs) {
              let decoded: ReturnType<typeof decodeEventLog>;
              try {
                decoded = decodeEventLog({
                  abi: poolEventsAbi,
                  data: l.data,
                  topics: l.topics,
                });
              } catch {
                continue;
              }
              const base = {
                key: `${l.transactionHash}-${l.logIndex}`,
                pool: p,
                blockNumber: l.blockNumber,
                txHash: l.transactionHash,
              };
              if (decoded.eventName === "Deposited") {
                const a = decoded.args as { member: string; value: bigint };
                out.push({ ...base, kind: "deposit", member: a.member, value: a.value });
              } else if (decoded.eventName === "Withdrawn") {
                const a = decoded.args as { member: string; value: bigint };
                out.push({ ...base, kind: "withdraw", member: a.member, value: a.value });
              } else {
                const a = decoded.args as { member: string };
                out.push({ ...base, kind: "join", member: a.member });
              }
            }
            return out;
          }),
        );
        if (cancelled) return;
        const all = perPool.flat().sort((a, b) => {
          if (a.blockNumber !== b.blockNumber)
            return a.blockNumber > b.blockNumber ? -1 : 1;
          return a.key < b.key ? 1 : -1;
        });
        setEvents(all);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, pool, pools, nonce]);

  return { events, isLoading };
}
