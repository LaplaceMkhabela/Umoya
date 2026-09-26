import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

// Demo network is Base Sepolia (84532) — Aave V3 has a Base Sepolia
// deployment; Lido Sepolia is deprecated so it is NOT the demo path.
export const demoChain = baseSepolia;

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "stage1-placeholder";

export const wagmiConfig = getDefaultConfig({
  appName: "Umoya",
  projectId,
  chains: [baseSepolia],
  ssr: true,
});
