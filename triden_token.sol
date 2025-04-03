// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TridenToken {
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  mapping(address account => uint256) private _balances;
  mapping(address => mapping(address => uint256)) private _allowances;

  address public owner;
  uint256 private _totalSupply;

  constructor() {
    owner = msg.sender;
    _totalSupply = 1_000_000_000 * 10 ** uint256(decimals()); // 1 mld tokens
    _balances[owner] = _totalSupply;
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

  // Mints new tokens.
  function _mint(uint256 value) external {
    require(msg.sender == owner, "You are not the owner");

    _balances[owner] += value;
    _totalSupply += value;
  }

  // Burns our tokens.
  function _burn(uint256 value) external {
    require(msg.sender == owner, "You are not the owner");
    require(_balances[owner] >= value, "Not enough tokens to burn");

    _balances[owner] -= value;
    _totalSupply -= value;
  }

  // Returns allowance for given sender/spender pair.
  function allowance(address sender, address spender) public view virtual returns (uint256) {
    return _allowances[sender][spender];
  }

  // Approves allowance for given spender. 
  function approve(address spender, uint256 amount) external returns (bool) {
    _allowances[msg.sender][spender] = amount;

    emit Approval(msg.sender, spender, amount);
    return true;
  }

  // Transfers allowance.
  function transferFrom(address sender, address to, uint256 amount) external returns (bool) {
    require(_allowances[sender][msg.sender] >= amount, "Not enough allowance");
    require(_balances[sender] >= amount, "Not enough tokens");

    _allowances[sender][msg.sender] -= amount;

    _balances[sender] -= amount;
    _balances[to] += amount;

    emit Transfer(sender, to, amount);
    return true;
  }
}
