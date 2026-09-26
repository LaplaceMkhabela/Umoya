// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { PoolFactory } from "../src/PoolFactory.sol";
import { GroupStakingPool } from "../src/GroupStakingPool.sol";
import { MockYieldStrategy } from "../src/strategies/MockYieldStrategy.sol";

/// @notice Core accounting: shares, proportional ownership, yield, withdrawals.
contract GroupStakingPoolTest is Test {
    PoolFactory internal factory;
    MockYieldStrategy internal mock;
    GroupStakingPool internal pool;

    address internal creator = makeAddr("creator");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        factory = new PoolFactory();
        mock = new MockYieldStrategy();
        vm.prank(creator);
        address poolAddr = factory.createGroup("Umoya Main", address(mock));
        pool = GroupStakingPool(payable(poolAddr));
        mock.setPoolOnce(poolAddr);
        deal(alice, 100 ether);
        deal(bob, 100 ether);
    }

    function testFirstDepositMintsOneToOne() public {
        vm.prank(alice);
        pool.deposit{ value: 1 ether }();
        assertEq(pool.shares(alice), 1 ether);
        assertEq(pool.totalShares(), 1 ether);
        assertEq(pool.totalValue(), 1 ether);
    }

    function testProportionalShares_Alice25_Bob75() public {
        vm.prank(alice);
        pool.deposit{ value: 1 ether }();
        vm.prank(bob);
        pool.deposit{ value: 3 ether }();
        assertEq(pool.shares(alice), 1 ether);
        assertEq(pool.shares(bob), 3 ether);
        assertEq(pool.previewWithdraw(pool.shares(alice)), 1 ether);
        assertEq(pool.previewWithdraw(pool.shares(bob)), 3 ether);
        assertEq(pool.memberCount(), 2);
    }

    function testYieldAccruesProRata_PlusPointFour() public {
        vm.prank(alice);
        pool.deposit{ value: 1 ether }();
        vm.prank(bob);
        pool.deposit{ value: 3 ether }();
        mock.donateYield{ value: 0.4 ether }();
        assertEq(pool.totalValue(), 4.4 ether);
        assertEq(pool.previewWithdraw(pool.shares(alice)), 1.1 ether);
        assertEq(pool.previewWithdraw(pool.shares(bob)), 3.3 ether);
    }

    function testWithdrawProRata_AfterYield() public {
        vm.prank(alice);
        pool.deposit{ value: 1 ether }();
        vm.prank(bob);
        pool.deposit{ value: 3 ether }();
        mock.donateYield{ value: 0.4 ether }();

        uint256 aliceBefore = alice.balance;
        uint256 aliceShares = pool.shares(alice); // read BEFORE prank: prank covers one call only
        vm.prank(alice);
        pool.withdraw(aliceShares);
        assertEq(alice.balance - aliceBefore, 1.1 ether);
        assertEq(pool.shares(alice), 0);
        // Bob untouched: still owns the rest.
        assertEq(pool.previewWithdraw(pool.shares(bob)), 3.3 ether);
        assertEq(pool.totalValue(), 3.3 ether);
        assertEq(pool.memberCount(), 1);
    }

    function testCannotWithdrawMoreThanHeld() public {
        vm.prank(alice);
        pool.deposit{ value: 1 ether }();
        vm.prank(alice);
        vm.expectRevert(GroupStakingPool.InsufficientShares.selector);
        pool.withdraw(1 ether + 1);
    }

    function testZeroDepositReverts() public {
        vm.prank(alice);
        vm.expectRevert(GroupStakingPool.ZeroDeposit.selector);
        pool.deposit();
    }

    function testSetStrategy_OnlyCreator() public {
        MockYieldStrategy mock2 = new MockYieldStrategy();
        vm.prank(bob);
        vm.expectRevert(GroupStakingPool.NotCreator.selector);
        pool.setStrategy(address(mock2));
        vm.prank(creator);
        vm.expectEmit(true, true, false, false);
        emit GroupStakingPool.StrategyUpdated(address(mock), address(mock2));
        pool.setStrategy(address(mock2));
        assertEq(address(pool.strategy()), address(mock2));
    }

    /// @notice No yield: both members exit fully; only dust (rounding) may remain.
    function testFuzz_FullExitLeavesOnlyDust(uint96 a, uint96 b) public {
        a = uint96(bound(a, 0.01 ether, 50 ether));
        b = uint96(bound(b, 0.01 ether, 50 ether));
        vm.prank(alice);
        pool.deposit{ value: a }();
        vm.prank(bob);
        pool.deposit{ value: b }();
        uint256 aliceShares = pool.shares(alice);
        uint256 bobShares = pool.shares(bob);
        vm.prank(alice);
        pool.withdraw(aliceShares);
        vm.prank(bob);
        pool.withdraw(bobShares);
        assertEq(pool.totalShares(), 0);
        assertLe(pool.totalValue(), 2 wei);
    }
}
