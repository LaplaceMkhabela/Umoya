# contracts — Foundry workspace (Stage 1 shell)

Solidity `0.8.24`, OpenZeppelin via `lib/` (installed in Stage 2).

## Install forge (Windows)

Foundry has no native `forge.exe` on this machine yet. Options:

```powershell
# 1) via Foundryup under Git Bash (recommended)
"C:\Program Files\Git\bin\bash.exe" -lc "curl -L https://foundry.paradigm.xyz | bash && foundryup"

# 2) or download nightly win64 bundle from
#    https://github.com/foundry-rs/foundry/releases and add to PATH
forge --version
```

## Stage 2 setup (not yet run)

```powershell
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge build
forge test
```

Expected Stage 1 result once forge exists: `forge build` compiles
`IYieldStrategy`, `GroupStakingPool` (stub), `PoolFactory` (stub).

## Env

```powershell
Copy-Item .env.example .env   # never commit .env
```

`BASE_SEPOLIA_RPC_URL` = Alchemy/QuickNode/Infura Base Sepolia endpoint.
`DEPLOYER_PRIVATE_KEY` = testnet-only key. `BASESCAN_API_KEY` for `--verify`.
