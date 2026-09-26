// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IYieldStrategy } from "../interfaces/IYieldStrategy.sol";

/// @notice Minimal WrappedTokenGatewayV3 surface (deposit/withdraw native ETH).
interface IWETHGateway {
    function depositETH(address pool, address onBehalfOf, uint16 referralCode) external payable;
    function withdrawETH(address pool, uint256 amount, address to) external;
}

/// @notice Aave PoolAddressesProvider: always resolve the current Pool dynamically.
interface IPoolAddressesProvider {
    function getPool() external view returns (address);
}

/// @title AaveStrategy — IYieldStrategy over the Aave V3 WETH reserve.
/// @notice ETH in -> gateway wraps + supplies WETH -> aWETH balance accrues interest.
///         Only the bound pool can move funds. Demo target: Base Sepolia (84532).
///         Reads Pool from the provider at construction so market upgrades don't brick it.
contract AaveStrategy is IYieldStrategy {
    using SafeERC20 for IERC20;

    address public immutable POOL;
    IWETHGateway public immutable GATEWAY;
    IERC20 public immutable AWETH;

    address public pool;
    bool private poolSet;

    event PoolBound(address indexed pool);

    error OnlyPool();
    error PoolAlreadySet();
    error ZeroAddress();

    modifier onlyPool() {
        if (msg.sender != pool) revert OnlyPool();
        _;
    }

    constructor(address provider, address gateway, address aweth) {
        if (provider == address(0) || gateway == address(0) || aweth == address(0)) revert ZeroAddress();
        POOL = IPoolAddressesProvider(provider).getPool();
        GATEWAY = IWETHGateway(gateway);
        AWETH = IERC20(aweth);
    }

    /// @notice Bind once to the pool this strategy serves.
    function setPoolOnce(address _pool) external {
        if (poolSet) revert PoolAlreadySet();
        if (_pool == address(0)) revert ZeroAddress();
        pool = _pool;
        poolSet = true;
        emit PoolBound(_pool);
    }

    function depositAssets() external payable override onlyPool {
        GATEWAY.depositETH{ value: msg.value }(POOL, address(this), 0);
    }

    /// @notice Pull `amount` of underlying value to `to`; returns ETH actually released.
    function withdrawAssets(uint256 amount, address to) external override onlyPool returns (uint256 withdrawn) {
        uint256 balanceBefore = to.balance;
        AWETH.forceApprove(address(GATEWAY), amount);
        GATEWAY.withdrawETH(POOL, amount, to);
        withdrawn = to.balance - balanceBefore;
    }

    /// @notice aWETH claim (auto-appreciating) + any idle ETH.
    function totalValue() external view override returns (uint256) {
        return AWETH.balanceOf(address(this)) + address(this).balance;
    }

    receive() external payable {}
}
