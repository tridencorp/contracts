// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TridenToken {
  event Transfer(address indexed from, address indexed to, uint256 value);

  mapping(address account => uint256) private _balances;
  
  uint256 private _totalSupply;

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
}
