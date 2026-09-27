// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { PoolFactory } from "../src/PoolFactory.sol";
import { GroupStakingPool } from "../src/GroupStakingPool.sol";
import { MockYieldStrategy } from "../src/strategies/MockYieldStrategy.sol";

/// @notice Seed local demo: create pool, bind mock, deposit + simulate yield.
///         POOL_FACTORY + MOCK_STRATEGY env required (see Deploy.s.sol output).
///         forge script script/SeedDemo.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
contract SeedDemo is Script {
    function run() external returns (address pool) {
        uint256 key = vm.envUint("DEPLOYER_PRIVATE_KEY");
        PoolFactory factory = PoolFactory(vm.envAddress("POOL_FACTORY"));
        MockYieldStrategy mock = MockYieldStrategy(payable(vm.envAddress("MOCK_STRATEGY")));
        vm.startBroadcast(key);
        pool = factory.createGroup("Umoya Main Pool", address(mock));
        mock.setPoolOnce(pool);
        GroupStakingPool(payable(pool)).deposit{ value: 10 ether }();
        mock.donateYield{ value: 0.5 ether }();
        vm.stopBroadcast();
        console.log("Demo pool:", pool);
    }
}
