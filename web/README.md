# web — Next.js shell (Stage 1)

Next.js 14 + TypeScript + Tailwind + Wagmi v2 + Viem + RainbowKit.
Demo chain: **Base Sepolia (84532)** only.

## Env

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

| Var                                  | Purpose                          |
| ------------------------------------ | -------------------------------- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | RainbowKit/WalletConnect (else placeholder) |
| `NEXT_PUBLIC_ALCHEMY_KEY` / RPC URL  | Optional custom Base Sepolia RPC |
| `NEXT_PUBLIC_POOL_FACTORY`           | Filled Stage 2 after deployment  |

## Stage 1 exit

`npm run build` passes and `<ConnectButton />` connects to Base Sepolia.
No contract calls yet — those land in Stage 3 against Stage 2 deployments.
Prototype reference: `../docs/index.html`.
