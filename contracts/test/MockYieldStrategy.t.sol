// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { MockYieldStrategy } from "../src/strategies/MockYieldStrategy.sol";

/// @notice Mock strategy: custody boundaries + yield simulation.
contract MockYieldStrategyTest is Test {
    MockYieldStrategy internal mock;
    address internal pool = makeAddr("pool");
    address internal stranger = makeAddr("stranger");

    function setUp() public {
        mock = new MockYieldStrategy();
        mock.setPoolOnce(pool);
        deal(pool, 10 ether);
    }

    function testOnlyPoolCanMoveFunds() public {
        vm.prank(pool);
        mock.depositAssets{ value: 1 ether }();
        assertEq(mock.totalValue(), 1 ether);

        vm.prank(stranger);
        vm.expectRevert(MockYieldStrategy.OnlyPool.selector);
        mock.withdrawAssets(1 ether, stranger);

        vm.prank(pool);
        uint256 out = mock.withdrawAssets(1 ether, pool);
        assertEq(out, 1 ether);
        assertEq(mock.totalValue(), 0);
    }

    function testDonateYield_RaisesTotalValue() public {
        vm.prank(pool);
        mock.depositAssets{ value: 4 ether }();
        mock.donateYield{ value: 0.4 ether }();
        assertEq(mock.totalValue(), 4.4 ether);
    }

    function testSetPoolOnce_CannotRebind() public {
        vm.expectRevert(MockYieldStrategy.PoolAlreadySet.selector);
        mock.setPoolOnce(stranger);
    }
}
