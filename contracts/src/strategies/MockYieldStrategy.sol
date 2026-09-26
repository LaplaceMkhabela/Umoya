// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IYieldStrategy } from "../interfaces/IYieldStrategy.sol";

/// @title MockYieldStrategy — TEST-ONLY strategy (Stage 2). Never production.
/// @notice Holds ETH 1:1. "Yield" = anyone sending ETH via donateYield/receive,
///         which raises totalValue() so existing shares appreciate.
///         Withdrawals restricted to the bound pool so strangers cannot drain it.
contract MockYieldStrategy is IYieldStrategy {
    address public pool;
    bool private poolSet;

    event PoolBound(address indexed pool);
    event YieldDonated(address indexed from, uint256 amount);

    error OnlyPool();
    error PoolAlreadySet();
    error EthSendFailed();
    error ZeroAddress();

    modifier onlyPool() {
        if (msg.sender != pool) revert OnlyPool();
        _;
    }

    /// @notice Bind once to the pool this mock serves (called right after pool creation).
    function setPoolOnce(address _pool) external {
        if (poolSet) revert PoolAlreadySet();
        if (_pool == address(0)) revert ZeroAddress();
        pool = _pool;
        poolSet = true;
        emit PoolBound(_pool);
    }

    function depositAssets() external payable override onlyPool {}

    function withdrawAssets(uint256 amount, address to) external override onlyPool returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        (bool ok,) = to.call{ value: amount }("");
        if (!ok) revert EthSendFailed();
        return amount;
    }

    function totalValue() external view override returns (uint256) {
        return address(this).balance;
    }

    /// @notice Simulate yield: real ETH in, share price up. Anyone may donate.
    function donateYield() external payable {
        emit YieldDonated(msg.sender, msg.value);
    }

    receive() external payable {}
}
