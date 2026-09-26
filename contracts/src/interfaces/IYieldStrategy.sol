// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title IYieldStrategy — boundary between pool accounting and DeFi.
/// @notice The pool NEVER knows if the strategy is Mock / Aave V3 / other.
///         It only calls: deposit value, withdraw value, read value.
///         Stage 2 adds MockYieldStrategy (+10% fake yield).
///         Stage 4 adds AaveStrategy (wstETH -> Aave V3, Base Sepolia).
///         Lido Sepolia is deprecated — do not build prod assumptions on it.
interface IYieldStrategy {
    /// @notice Deposit native ETH held by the pool into the strategy.
    /// @dev Called with value: strategy.depositAssets{value: amount}().
    function depositAssets() external payable;

    /// @notice Withdraw `amount` of underlying value back to the pool.
    /// @param amount Native-ETH-denominated value to pull.
    /// @param to Recipient (always the pool in Stage 2+).
    /// @return withdrawn Actual value received.
    function withdrawAssets(uint256 amount, address to) external returns (uint256 withdrawn);

    /// @notice Current total value controlled by this strategy (in wei).
    function totalValue() external view returns (uint256);
}
