import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { defineChain } from "viem";
import { http } from "wagmi";

// Local Anvil stack (contracts/broadcast/*). Demo network alongside Base Sepolia.
export const localhost = defineChain({
  id: 31337,
  name: "Localhost",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
});

export const demoChain = localhost;

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "stage1-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "Umoya",
  projectId,
  chains: [localhost, baseSepolia],
  transports: {
    [localhost.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
