// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
  function transfer(address to, uint256 amount) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
}

contract Presale is ReentrancyGuard {
  address public owner;
  IERC20  public token;

  bool public active;

  uint256 constant WEI = 1e18;

  uint256 public tokenPrice;
  uint256 minAmount;

  event TokensPurchased(address buyer, uint256 ethAmount, uint256 tokenAmount);

  modifier onlyOwner() {
    require(msg.sender == owner, "You are not the owner");
    _;
  }

  constructor() {
    owner = msg.sender;
    active = true;
    token = IERC20(0x094f29c7f343Ad401CE7C7bad9E969dfD4AeaB8F);

    tokenPrice = WEI / 200000;
    minAmount = 500 * tokenPrice;
  }

  receive() external payable nonReentrant {
    require(active, "Presale is not active");
    require(msg.value >= minAmount, "Below minimum amount");

    uint256 tokens = tokensPerETH(msg.value);
    require(token.balanceOf(address(this)) >= tokens, "Insufficient tokens");
    require(token.transfer(msg.sender, tokens), "Token transfer failed");

    emit TokensPurchased(msg.sender, msg.value, tokens);
  }

  fallback() external payable {
    revert("Unsupported call");
  }

  function tokensPerETH(uint256 amount) public view returns (uint256) {
    return amount / tokenPrice;
  }

  function setTokenAddress(address _address) external onlyOwner {
    token = IERC20(_address);
  }

  function setActive(bool flag) external onlyOwner {
    active = flag;
  }

  function setTokenPrice(uint256 price, uint256 min) external onlyOwner {
    require(price > 0, "Token price must be greater than 0");
    require(min > 0, "Minimum amount must be greater than 0");

    tokenPrice = price;
    minAmount = min * price;
  }

  function withdrawETH() external onlyOwner {
    payable(owner).transfer(address(this).balance);
  }

  function withdrawTokens(uint256 amount) external onlyOwner {
    require(token.transfer(owner, amount), "Withdraw failed");
  }
}
