import { baseSepolia } from "wagmi/chains";

export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id; // 84532

// Filled in Stage 2 after `forge script ... --broadcast` on Base Sepolia.
export const POOL_FACTORY_ADDRESS =
  (process.env.NEXT_PUBLIC_POOL_FACTORY as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";

export const isFactoryWired =
  POOL_FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000";
