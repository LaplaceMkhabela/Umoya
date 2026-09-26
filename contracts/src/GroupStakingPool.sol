// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IYieldStrategy } from "./interfaces/IYieldStrategy.sol";

/// @title GroupStakingPool — proportional-share stokvel pool (Stage 2).
/// @notice Ownership = member shares / total shares. v1 has NO time-weighting
///         and NO withdrawal fee (per spec). ETH-native: members deposit ETH,
///         the pool forwards it to `strategy`, yield accrues as strategy value.
///         The frontend NEVER computes ownership — this contract is the truth.
contract GroupStakingPool is ReentrancyGuard {
    string public name;
    address public immutable creator;
    IYieldStrategy public strategy;

    uint256 public totalShares;
    mapping(address => uint256) public shares;
    uint256 public memberCount;

    event MemberJoined(address indexed member);
    event Deposited(address indexed member, uint256 value, uint256 sharesMinted);
    event Withdrawn(address indexed member, uint256 value, uint256 sharesBurned);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);

    error ZeroDeposit();
    error ZeroSharesMinted();
    error ZeroWithdraw();
    error InsufficientShares();
    error EthSendFailed();
    error NotCreator();
    error ZeroAddress();

    constructor(string memory _name, address _creator, address _strategy) {
        if (_creator == address(0) || _strategy == address(0)) revert ZeroAddress();
        name = _name;
        creator = _creator;
        strategy = IYieldStrategy(_strategy);
    }

    /// @notice Idle ETH + strategy value. Strategy holds deposits (pool forwards on deposit).
    function totalValue() public view returns (uint256) {
        return address(this).balance + strategy.totalValue();
    }

    function balanceOf(address member) external view returns (uint256) {
        return shares[member];
    }

    /// @notice Shares minted for `value` at CURRENT (pre-deposit) valuation. Rounds down.
    /// @dev For off-chain quotes only. Inside deposit(), msg.value is already in
    ///      address(this).balance, so the pool subtracts it (see deposit()).
    function previewDeposit(uint256 value) public view returns (uint256) {
        return _previewDeposit(value, totalValue());
    }

    function _previewDeposit(uint256 value, uint256 valueBefore) internal view returns (uint256) {
        if (totalShares == 0 || valueBefore == 0) return value; // first deposit: 1:1
        return (value * totalShares) / valueBefore;
    }

    /// @notice ETH value of `shareAmount` at current valuation. Rounds down; dust stays in pool.
    function previewWithdraw(uint256 shareAmount) public view returns (uint256) {
        if (totalShares == 0) return 0;
        return (shareAmount * totalValue()) / totalShares;
    }

    /// @notice Deposit ETH, receive proportional shares. Forwards ETH to the strategy.
    function deposit() external payable nonReentrant {
        if (msg.value == 0) revert ZeroDeposit();
        // msg.value is already credited to address(this).balance: exclude it for pre-deposit valuation.
        uint256 sharesToMint = _previewDeposit(msg.value, totalValue() - msg.value);
        if (sharesToMint == 0) revert ZeroSharesMinted();

        if (shares[msg.sender] == 0) {
            memberCount += 1;
            emit MemberJoined(msg.sender);
        }
        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
        emit Deposited(msg.sender, msg.value, sharesToMint);

        strategy.depositAssets{ value: msg.value }();
    }

    /// @notice Burn shares, receive pro-rata ETH. Checks-effects-interactions + guard.
    function withdraw(uint256 shareAmount) external nonReentrant {
        if (shareAmount == 0) revert ZeroWithdraw();
        uint256 held = shares[msg.sender];
        if (shareAmount > held) revert InsufficientShares();

        uint256 value = previewWithdraw(shareAmount);
        shares[msg.sender] = held - shareAmount;
        totalShares -= shareAmount;
        if (shares[msg.sender] == 0) memberCount -= 1;

        uint256 paid = 0;
        if (value > 0) {
            // Pay out what the strategy actually released; any residual stays pooled.
            paid = strategy.withdrawAssets(value, address(this));
            (bool ok,) = msg.sender.call{ value: paid }("");
            if (!ok) revert EthSendFailed();
        }
        emit Withdrawn(msg.sender, paid, shareAmount);
    }

    /// @notice Narrow admin power: creator may point at a different STRATEGY contract.
    ///         Cannot move user funds, cannot mint shares, cannot skip accounting.
    function setStrategy(address _strategy) external {
        if (msg.sender != creator) revert NotCreator();
        if (_strategy == address(0)) revert ZeroAddress();
        address old = address(strategy);
        strategy = IYieldStrategy(_strategy);
        emit StrategyUpdated(old, _strategy);
    }

    /// @notice Accepts ETH pulled back from the strategy during withdrawals.
    receive() external payable {}
}
