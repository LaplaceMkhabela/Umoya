import { formatEther } from "viem";
import { ZAR_PER_ETH } from "./contracts";

/** 1.23456789 ETH -> "1.2345" (trailing zeros trimmed). */
export function fmtEth(value: bigint | undefined, digits = 4): string {
  if (value === undefined) return "—";
  const [whole, frac = ""] = formatEther(value).split(".");
  const cut = frac.slice(0, digits).replace(/0+$/, "");
  return cut.length > 0 ? `${whole}.${cut}` : whole;
}

/** Display-only fiat estimate, always labeled as such at the call site. */
export function fmtZarEst(value: bigint | undefined): string {
  if (value === undefined) return "—";
  const eth = Number(formatEther(value));
  return `R ${Math.round(eth * ZAR_PER_ETH).toLocaleString("en-ZA")}`;
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
