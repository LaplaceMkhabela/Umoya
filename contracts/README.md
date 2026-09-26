# contracts — Foundry workspace (Stage 2 done, 13/13 tests green)

Solidity `0.8.24`, OpenZeppelin (`lib/openzeppelin-contracts`) + `forge-std` vendored.
Toolchain: forge 1.8.3 via foundryup (`~/.foundry/bin`).

## Commands

```powershell
cd contracts
forge build
forge test
```

`script/Deploy.s.sol` deploys `MockYieldStrategy` + `PoolFactory`
(Stage 4 adds the Aave strategy + Base Sepolia broadcast).

## Env

```powershell
Copy-Item .env.example .env   # never commit .env
```

`BASE_SEPOLIA_RPC_URL` = Alchemy/QuickNode/Infura Base Sepolia endpoint.
`DEPLOYER_PRIVATE_KEY` = testnet-only key. `BASESCAN_API_KEY` for `--verify`.
