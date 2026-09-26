// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { PoolFactory } from "../src/PoolFactory.sol";
import { MockYieldStrategy } from "../src/strategies/MockYieldStrategy.sol";

/// @notice Deploy demo stack to Base Sepolia (Stage 2: Mock strategy; Stage 4: Aave).
///         forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
contract Deploy is Script {
    function run() external returns (PoolFactory factory, MockYieldStrategy strategy) {
        uint256 key = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(key);
        strategy = new MockYieldStrategy();
        factory = new PoolFactory();
        vm.stopBroadcast();
        console.log("MockYieldStrategy:", address(strategy));
        console.log("PoolFactory:", address(factory));
    }
}
