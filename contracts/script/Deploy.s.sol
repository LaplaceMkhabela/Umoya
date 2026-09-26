// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { PoolFactory } from "../src/PoolFactory.sol";

/// @notice Stage 1 deploy skeleton. Stage 2 wires constructor args + strategies.
///         forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
contract Deploy is Script {
    function run() external returns (PoolFactory factory) {
        uint256 key = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(key);
        factory = new PoolFactory();
        vm.stopBroadcast();
        console.log("PoolFactory:", address(factory));
    }
}
