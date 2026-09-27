// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test, Vm } from "forge-std/Test.sol";
import { PoolFactory } from "../src/PoolFactory.sol";
import { GroupStakingPool } from "../src/GroupStakingPool.sol";
import { MockYieldStrategy } from "../src/strategies/MockYieldStrategy.sol";

/// @notice Factory registry: deployment tracking + events.
contract PoolFactoryTest is Test {
    PoolFactory internal factory;
    MockYieldStrategy internal mock;
    address internal creator = makeAddr("creator");

    function setUp() public {
        factory = new PoolFactory();
        mock = new MockYieldStrategy();
    }

    function testCreateGroup_EmitsGroupCreated() public {
        vm.recordLogs();
        vm.prank(creator);
        address poolAddr = factory.createGroup("Family Legacy Fund", address(mock));
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 1);
        assertEq(logs[0].topics[0], keccak256("GroupCreated(address,address,string)"));
        assertEq(logs[0].topics[1], bytes32(uint256(uint160(poolAddr))));
        assertEq(logs[0].topics[2], bytes32(uint256(uint160(creator))));
        assertEq(abi.decode(logs[0].data, (string)), "Family Legacy Fund");
    }

    function testCreateGroup_AutoBindsStrategy() public {
        vm.prank(creator);
        address poolAddr = factory.createGroup("Bound Pool", address(mock));
        assertEq(mock.pool(), poolAddr);
        // Pool is immediately usable: deposit works without manual binding.
        deal(creator, 10 ether);
        vm.prank(creator);
        GroupStakingPool(payable(poolAddr)).deposit{ value: 1 ether }();
        assertEq(GroupStakingPool(payable(poolAddr)).shares(creator), 1 ether);
    }

    function testCreateGroup_RevertsWhenStrategyBound() public {
        vm.prank(creator);
        factory.createGroup("First", address(mock));
        vm.prank(creator);
        vm.expectRevert(PoolFactory.StrategyBindFailed.selector);
        factory.createGroup("Second", address(mock));
    }

    function testCreateGroup_TracksPools() public {
        vm.startPrank(creator);
        address p1 = factory.createGroup("Pool One", address(mock));
        address p2 = factory.createGroup("Pool Two", address(mock));
        vm.stopPrank();
        assertEq(factory.poolCount(), 2);
        assertTrue(factory.isPool(p1));
        assertTrue(factory.isPool(p2));
        address[] memory all = factory.allPools();
        assertEq(all.length, 2);
        assertEq(all[0], p1);
        assertEq(all[1], p2);
        assertEq(GroupStakingPool(payable(p1)).creator(), creator);
        assertEq(GroupStakingPool(payable(p1)).name(), "Pool One");
    }
}
