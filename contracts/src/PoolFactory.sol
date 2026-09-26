// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { GroupStakingPool } from "./GroupStakingPool.sol";

/// @title PoolFactory — STUB (Stage 2 implements).
/// @notice Deploys GroupStakingPool clones + emits GroupCreated.
contract PoolFactory {
    event GroupCreated(address indexed pool, address indexed creator, string name);

    // solhint-disable-next-line no-empty-blocks
    constructor() {}

    /// @dev Stage 2: createGroup(string name) -> address pool.
    function version() external pure returns (string memory) {
        return "umoya-factory/stage1-stub";
    }
}
