// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TridenToken {
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  mapping(address account => uint256) private _balances;
  mapping(address => mapping(address => uint256)) private _allowances;

  address private _owner;
  uint256 private _totalSupply;

  constructor() {
    _owner = msg.sender;
    _totalSupply = 5_000_000_000 * (10 ** uint256(decimals()));
    _balances[_owner] = _totalSupply;
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

  // Returns owner.
  function owner() public view returns (address) {
    return _owner;
  }

  // Returns contract total supply.
  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  // Returns balance of give address.
  function balanceOf(address account) public view returns (uint256) {
    return _balances[account];
  }

  // Transfers contract ownership.
  function transferOwnership(address newOwner) external {
    require(newOwner != address(0), "New owner cannot be zero address");
    require(msg.sender == _owner, "You are not the owner");

    _owner = newOwner;
  }

  // Transfer tokens.
  function transfer(address to, uint256 amount) public returns (bool) {
    require(to != address(0), "Recipient cannot be zero address");

    _balances[msg.sender] -= amount;
    _balances[to] += amount;

    emit Transfer(msg.sender, to, amount);
    return true;
  }

  // Mints new tokens.
  function mint(uint256 value) external {
    require(msg.sender == _owner, "You are not the owner");

    _balances[_owner] += value;
    _totalSupply += value;

    emit Transfer(address(0), _owner, value);
  }

  // Burns our tokens.
  function burn(uint256 value) external {
    require(msg.sender == _owner, "You are not the owner");
    
    _balances[_owner] -= value;
    _totalSupply -= value;
  }

  // Returns allowance for given sender/spender pair.
  function allowance(address sender, address spender) public view returns (uint256) {
    return _allowances[sender][spender];
  }

  // Approves allowance for given spender. 
  function approve(address spender, uint256 amount) external returns (bool) {
    _allowances[msg.sender][spender] = amount;

    emit Approval(msg.sender, spender, amount);
    return true;
  }

  // Transfer allowance.
  function transferFrom(address sender, address to, uint256 amount) external returns (bool) {
    require(to != address(0), "Recipient cannot be zero address");

    _allowances[sender][msg.sender] -= amount;

    _balances[sender] -= amount;
    _balances[to] += amount;

    emit Transfer(sender, to, amount);
    return true;
  }
}
