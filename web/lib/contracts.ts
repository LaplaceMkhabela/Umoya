import { baseSepolia } from "wagmi/chains";
import { localhost } from "./wagmi";

export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id; // 84532
export const LOCALHOST_CHAIN_ID = localhost.id; // 31337
export const SUPPORTED_CHAIN_IDS = [LOCALHOST_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID] as const;

type HexAddress = `0x${string}`;
const ZERO: HexAddress = "0x0000000000000000000000000000000000000000";

function envAddress(name: string): HexAddress {
  const v = process.env[name] as HexAddress | undefined;
  return v ?? ZERO;
}

// Filled after Stage 2/4 deployments (web/.env.local for anvil; hosting env for Base Sepolia).
export const POOL_FACTORY_ADDRESS = envAddress("NEXT_PUBLIC_POOL_FACTORY");
export const MOCK_STRATEGY_ADDRESS = envAddress("NEXT_PUBLIC_MOCK_STRATEGY");
export const DEMO_POOL_ADDRESS = envAddress("NEXT_PUBLIC_DEMO_POOL");

export const isFactoryWired = POOL_FACTORY_ADDRESS !== ZERO;

// Display-only fiat estimate. Contract truth is always ETH (wei) on-chain.
export const ZAR_PER_ETH = 95_000;
