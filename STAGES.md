# Umoya — Build Stages

> Save together. Grow together. Own it on-chain.
> Spec: `docs/Umoya_Project_Compilation.pdf` · Prototype: `docs/index.html`

| #   | Stage                        | Status         | Notes                                                                                       |
| --- | ---------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| 1   | Foundation                   | ✅ Done        | Repo layout, Foundry shell + `IYieldStrategy`, Next.js shell, Base Sepolia wagmi config, `tsc` green |
| 2   | Core pool accounting         | ✅ Done        | `GroupStakingPool` + `PoolFactory` + `MockYieldStrategy`, 13/13 Foundry tests green (forge 1.8.3) |
| 3   | Frontend (live reads/writes) | ❌ Not started | Port `docs/index.html` 5 tabs/sheets to Wagmi reads/writes against Stage 2 deployments          |
| 4   | Real strategy end-to-end     | ❌ Not started | `Mock → Aave V3` swap via `IYieldStrategy`, Base Sepolia deploy + verify                        |
| 5   | Harden, polish, submit       | ❌ Not started | Invariant tests, mobile pass, tx states, architecture slide, pitch, backup demo                 |

## Stage 1 — Foundation ✅

Done:

- [x] `.gitignore`, `README.md`, `docs/` committed
- [x] `contracts/`: `foundry.toml` (Base Sepolia endpoints), `IYieldStrategy.sol`
      (`depositAssets` / `withdrawAssets` / `totalValue`), `PoolFactory` +
      `GroupStakingPool` stubs, `Deploy.s.sol` skeleton, `.env.example`
- [x] `web/`: Next.js 14 + TS + Tailwind + Wagmi v2/Viem/RainbowKit,
      Base Sepolia-only config (`lib/wagmi.ts`), `ConnectButton` home page,
      `package-lock.json` committed
- [x] `tsc --noEmit` passes

Outstanding (non-blocking for Stage 2 start):

- [ ] `forge build` — no `forge` binary on this machine yet
      (see `contracts/README.md` for install steps)
- [ ] `next build` final green — dependency tree was repaired after
      interrupted installs; re-run `npm run build` in `web/` to confirm

## Stage 2 — Core pool accounting ✅

Done (`forge 1.8.3`, `contracts/`):

- [x] `GroupStakingPool`: proportional shares, `ReentrancyGuard`,
      checks-effects-interactions, creator-only `setStrategy` (narrow power),
      zero-address guards, no time-weighting/fees in v1
- [x] Accounting fix found by tests: `deposit()` excludes `msg.value` from
      pre-deposit valuation (value is already in `pool.balance` on entry)
- [x] Events: `MemberJoined`, `Deposited`, `Withdrawn`, `StrategyUpdated`, `GroupCreated`
- [x] `PoolFactory.createGroup(name, strategy)` + registry (`isPool`, `allPools`)
- [x] `MockYieldStrategy`: 1:1 custody, `donateYield` simulates returns,
      `onlyPool` withdrawals, one-time pool binding
- [x] 13/13 tests green: 1:1 first deposit, Alice 1 + Bob 3 → 25/75%,
      +0.4 yield → 1.1/3.3, pro-rata exit, access-control reverts,
      fuzz full-exit leaves ≤2 wei dust (256 runs)
- [x] `forge build` clean (lint warnings only); `script/Deploy.s.sol` deploys factory + mock

## Stage 3 — Frontend ❌

- [ ] Port `docs/index.html`: Today / Stokvels / Transfer / Activity / Profile,
      contribute/withdraw sheets, create-pool sliders, streak + milestone overlays
- [ ] Replace mock JS state with Wagmi reads + event history; ETH on-chain, ZAR display-only

## Stage 4 — Real strategy ❌

- [ ] `AaveStrategy: IYieldStrategy` (wstETH → Aave V3, Base Sepolia)
- [ ] Deploy + verify on Base Sepolia; end-to-end deposit → yield → withdraw

## Stage 5 — Polish & submit ❌

- [ ] Loading/empty/error states, mobile 390px pass, demo rehearsal,
      architecture slide, README demo instructions, recorded backup demo
