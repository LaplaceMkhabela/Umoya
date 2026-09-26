// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { AaveStrategy } from "../src/strategies/AaveStrategy.sol";

/// @notice Deploy the real strategy on Base Sepolia (84532).
///         forge script script/DeployAave.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
contract DeployAave is Script {
    // Aave V3 Base Sepolia (aave-address-book AaveV3BaseSepoliaLido).
    address internal constant PROVIDER = 0x6f7E694fe5250Ce638fFE95524760422E6e41997;
    address internal constant GATEWAY = 0x63bBa35193cB5E061E8F0318F8A1788EA34E5198;
    address internal constant AWETH = 0xFBcD8add8F85BdfeDfF99E20D6fc4b215a9C96e3;

    function run() external returns (AaveStrategy strategy) {
        uint256 key = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(key);
        strategy = new AaveStrategy(PROVIDER, GATEWAY, AWETH);
        vm.stopBroadcast();
        console.log("AaveStrategy:", address(strategy));
        console.log("Aave Pool:", strategy.POOL());
    }
}
