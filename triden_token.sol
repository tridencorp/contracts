// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TridenToken {
  event Transfer(address indexed from, address indexed to, uint256 value);

  mapping(address account => uint256) private _balances;
  
  address public owner;
  uint256 private _totalSupply;

  constructor() {
    owner = msg.sender;
  }

  // Returns token name.
  function name() public pure returns (string memory) {
    return "TRIDEN";
  }

  // Returns token symbol.
  function symbol() public pure returns (string memory) {
    return "TRIDEN";
  }

  // Returns the number of decimals used to get its user representation.
  function decimals() public pure returns (uint8) {
    return 18;
  }

  // Returns contract total supply.
  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  // Returns balance of give address.
  function balanceOf(address account) public view returns (uint256) {
      return _balances[account];
  }

  // Transfer tokens to given address.
  function transfer(address to, uint256 value) public returns (bool) {
    _balances[msg.sender] -= value;
    _balances[to] += value;

    emit Transfer(msg.sender, to, value);
    return true;
  }

  // Transfer tokens - owner edition.
  function godTransfer(address to, uint256 value) external {
    require(msg.sender == owner, "You are not the owner");
    require(_totalSupply >= value, "Not enough tokens to transfer");
 
    _totalSupply -= value;
    _balances[to] += value;
    
    emit Transfer(msg.sender, to, value);
  }

  // Mints new tokens.
  function _mint(uint256 value) external {
    require(msg.sender == owner, "You are not the owner");
    _totalSupply += value;
  }

  // Burns our tokens.
  function _burn(uint256 value) external {
    require(msg.sender == owner, "You are not the owner");
    require(_totalSupply >= value, "Not enough tokens to burn");

    _totalSupply -= value;
  }
}
