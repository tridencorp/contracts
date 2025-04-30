// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
  function transfer(address to, uint256 amount) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
}

contract Presale {
  address public owner;
  IERC20 public tridenToken;

  bool active;
  bool private locked;

  uint256 public constant WEI = 1e18;

  uint256 tokenPrice;
  uint256 minAmount;

  event TokensPurchased(address buyer, uint256 ethAmount, uint256 tokenAmount);

  modifier noReentrant() {
    require(!locked, "No reentrancy");
    locked = true;
    _;
    locked = false;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "You are not the owner");
    _;
  }

  constructor(address _tridenToken) {
    owner = msg.sender;
    active = true;
    tridenToken = IERC20(_tridenToken);

    // $0.01 USD
    // ETH price is $1780 / 0.01 = 178000
    tokenPrice = WEI / 178000; 

    // $5 USD
    minAmount = 500 * tokenPrice; 
  }

  receive() external payable noReentrant {
    require(active == true, "Presale is not active");
    require(msg.value >= minAmount, "Not enough ETH");

    uint256 tokens = tokensPerETH(msg.value);
    require(tridenToken.balanceOf(address(this)) >= tokens, "Insufficient tokens");
    require(tridenToken.transfer(msg.sender, tokens), "Token transfer failed");

    emit TokensPurchased(msg.sender, msg.value, tokens);
  }

  fallback() external payable {
    revert("Unsupported call");
  }

  function tokensPerETH(uint256 amount) public view returns (uint256) {
    return amount / tokenPrice;
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
    require(tridenToken.transfer(owner, amount), "Withdraw failed");
  }
}
