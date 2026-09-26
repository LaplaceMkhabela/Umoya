// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { GroupStakingPool } from "../src/GroupStakingPool.sol";
import { AaveStrategy } from "../src/strategies/AaveStrategy.sol";

/// @notice Live-integration test. Requires a Base Sepolia fork:
///         forge test --match-contract AaveStrategyForkTest --fork-url https://sepolia.base.org
contract AaveStrategyForkTest is Test {
    address internal constant PROVIDER = 0x6f7E694fe5250Ce638fFE95524760422E6e41997;
    address internal constant GATEWAY = 0x63bBa35193cB5E061E8F0318F8A1788EA34E5198;
    address internal constant AWETH = 0xFBcD8add8F85BdfeDfF99E20D6fc4b215a9C96e3;

    AaveStrategy internal strategy;
    GroupStakingPool internal pool;

    function setUp() public {
        strategy = new AaveStrategy(PROVIDER, GATEWAY, AWETH);
        assertTrue(strategy.POOL() != address(0));
        pool = new GroupStakingPool("Fork Pool", address(this), address(strategy));
        strategy.setPoolOnce(address(pool));
        deal(address(this), 10 ether);
    }

    function testFork_SupplyAccrueWithdraw() public {
        pool.deposit{ value: 1 ether }();
        uint256 afterDeposit = strategy.totalValue();
        assertApproxEqAbs(afterDeposit, 1 ether, 1 wei);

        // Testnet WETH utilization is ~zero, so interest may round to 0:
        // assert custody (no loss), not a specific APY.
        skip(30 days);
        assertGe(strategy.totalValue(), 1 ether, "strategy must not lose principal");

        uint256 shares = pool.shares(address(this));
        uint256 before = address(this).balance;
        pool.withdraw(shares);
        uint256 received = address(this).balance - before;
        // Aave rounds withdrawals down by dust (~gwei scale); residual stays pooled by design.
        assertApproxEqAbs(received, 1 ether, 1e12, "principal back on full exit");
        assertEq(pool.totalValue(), 0);
    }

    receive() external payable {}
}
