# Umoya — Programmable On-Chain Stokvel

> Save together. Grow together. Own it on-chain.

Umoya turns the traditional stokvel into a non-custodial group savings pool:
`Members -> Group Pool (shares) -> Yield Strategy (Aave V3) -> Pro-rata returns`.

Prototype UI: [`docs/index.html`](docs/index.html).
Full strategy + spec: [`docs/Umoya_Project_Compilation.pdf`](docs/Umoya_Project_Compilation.pdf).

## Repo layout (Stage 1)

```text
contracts/          # Foundry workspace (Solidity 0.8.24, OZ)
  src/interfaces/IYieldStrategy.sol
  src/PoolFactory.sol        # stub -> Stage 2
  src/GroupStakingPool.sol   # stub -> Stage 2
  src/strategies/            # Stage 2+: Mock + Aave V3
  test/ script/              # Stage 2+
web/                # Next.js 14 + TS + Tailwind + Wagmi/Viem + RainbowKit
  app/ lib/wagmi.ts
```

## Networks

| Env   | Chain        | Chain ID | Strategy            |
| ----- | ------------ | -------- | ------------------- |
| Demo  | Base Sepolia | 84532    | Mock, then Aave V3  |
| Prod* | Base / L1    | 8453 / 1 | Aave V3 + wstETH    |

\* Lido Sepolia is deprecated (use Hoodi for Lido testnet). Never hardcode Sepolia+Lido.
Aave V3 lists Base + Base Sepolia deployments — hence Base Sepolia for the demo.

## Quickstart

```powershell
# contracts (needs forge; see contracts/README.md)
cd contracts
forge build
forge test

# web
cd web
npm install
cp .env.example .env.local   # fill ALCHEMY / WalletConnect id
npm run dev                  # http://localhost:3000
```

## Stages

1. **Foundation** (this commit) — repo, Foundry shell, web shell, Base Sepolia config
2. Core pool accounting (shares, deposit/withdraw, events, tests)
3. Frontend port of `docs/index.html` to real reads/writes
4. Real strategy (Mock -> Aave V3) end-to-end
5. Harden, polish, submit
