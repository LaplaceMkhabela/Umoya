// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { GroupStakingPool } from "./GroupStakingPool.sol";

/// @title PoolFactory — deploys GroupStakingPool instances (Stage 2).
contract PoolFactory {
    event GroupCreated(address indexed pool, address indexed creator, string name);

    address[] private _pools;
    mapping(address => bool) public isPool;

    /// @notice Deploy a pool bound to `strategy`. Caller becomes pool creator (narrow strategy-swap right only).
    function createGroup(string calldata groupName, address strategy) external returns (address pool) {
        GroupStakingPool p = new GroupStakingPool(groupName, msg.sender, strategy);
        pool = address(p);
        _pools.push(pool);
        isPool[pool] = true;
        emit GroupCreated(pool, msg.sender, groupName);
    }

    function allPools() external view returns (address[] memory) {
        return _pools;
    }

    function poolCount() external view returns (uint256) {
        return _pools.length;
    }

    function version() external pure returns (string memory) {
        return "umoya-factory/stage2";
    }
}
