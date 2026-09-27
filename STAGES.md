# Umoya — Build Stages

> Save together. Grow together. Own it on-chain.
> Spec: `docs/Umoya_Project_Compilation.pdf` · Prototype: `docs/index.html`

| #   | Stage                        | Status         | Notes                                                                                       |
| --- | ---------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| 1   | Foundation                   | ✅ Done        | Repo layout, Foundry shell + `IYieldStrategy`, Next.js shell, Base Sepolia wagmi config, `tsc` green |
| 2   | Core pool accounting         | ✅ Done        | `GroupStakingPool` + `PoolFactory` + `MockYieldStrategy`, 13/13 Foundry tests green (forge 1.8.3) |
| 3   | Frontend (live reads/writes) | ✅ Running    | All pages live on `http://localhost:3000` vs anvil; wallet stack pinned coherent; `next build` green |
| 4   | Real strategy end-to-end     | 🔶 Contract done | `AaveStrategy` fork-tested on Base Sepolia; live deploy + UI E2E pending (needs Stage 3) |
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

## Stage 3 — Frontend ✅ (running on localhost:3000)

- [x] Wagmi localhost (31337) + Base Sepolia config; ABIs exported from forge artifacts
- [x] Pages: Today (position + sheets + activity), Stokvels (search + create),
      Pool detail (value/share/withdraw/activity), Transfer, Activity (event logs),
      Profile (on-chain stats) + bottom tab bar, toasts
- [x] Wallet stack pinned coherent (wagmi 2.12.11 / viem 2.21.19 / rainbowkit 2.2.4);
      `tsc` + `next build` green; production server serves HTTP 200
- [ ] New pools via UI need per-pool strategy deploy (factory enforces 1:1 binding;
      redeploy + UI two-step pending)
- [ ] Real WalletConnect projectId for non-injected wallets (dummy in `.env.local`)

## Stage 4 — Real strategy 🔶 (contract done, live deploy pending)

- [x] `AaveStrategy: IYieldStrategy` — ETH → WETHGateway → aWETH (Base Sepolia:
      provider `0x6f7E…1997`, gateway `0x63bB…198`, aWETH `0xFBcD…96e3`);
      Pool resolved dynamically from provider; `onlyPool` fund movement
- [x] Fork-tested on Base Sepolia (`--fork-url https://sepolia.base.org`):
      supply → 30d → full exit returns principal (Aave dust ~gwei stays pooled);
      testnet WETH utilization ≈ 0 so no measurable interest — no-loss asserted instead
- [x] `script/DeployAave.s.sol` ready for live broadcast
- [ ] Live Base Sepolia deploy + verify (needs funded testnet key)
- [ ] UI end-to-end (needs Stage 3 pages)

## Stage 5 — Polish & submit ❌

- [ ] Loading/empty/error states, mobile 390px pass, demo rehearsal,
      architecture slide, README demo instructions, recorded backup demo
