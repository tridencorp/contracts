// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
  function transfer(address to, uint256 amount) external returns (bool);
}

contract Presale {
  address public owner;
  IERC20 public tridenToken;
  bool active;

  uint256 public constant WEI = 1e18;

  uint256 tokenPrice;
  uint256 min;

  event TokensPurchased(address buyer, uint256 ethAmount, uint256 tokenAmount);

  constructor(address _tridenToken) {
    owner = msg.sender;
    active = true;
    tridenToken = IERC20(_tridenToken);

    // Initially our token price is set to $0.01. Currently ETH price
    // is around $1780 so 1780 / 0.01 is 178000.
    tokenPrice = WEI / 178000;

    min = 500 * tokenPrice; // ~5 USD
  }

  receive() external payable {
    require(msg.value >= min, "Not enough ETH");
    require(active == true, "Presale is currently closed");

    uint256 tokens = tokensPerETH(msg.value);
    require(tridenToken.transfer(msg.sender, tokens), "Token transfer failed");

    emit TokensPurchased(msg.sender, msg.value, tokens);
  }

  fallback() external payable {
    revert("Unsupported call");
  }

  function tokensPerETH(uint256 amount) public view returns (uint256) {
    return amount / tokenPrice;
  }

  function setActive(bool flag) external {
    require(msg.sender == owner, "You are not the owner");
    active = flag;
  }

  function setTokePrice(uint256 price) external {
    require(msg.sender == owner, "You are not the owner");
    tokenPrice = price;
  }

  function withdrawETH() external {
    require(msg.sender == owner, "You are not the owner");
    payable(owner).transfer(address(this).balance);
  }

  function withdrawTokens(uint256 amount) external {
    require(msg.sender == owner, "You are not the owner");
    require(tridenToken.transfer(owner, amount), "Withdraw failed");
  }
}
