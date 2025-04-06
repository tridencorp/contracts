const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleERC20", function () {
  let token;
  let owner;
  let recipient;
  let hacker;

  // Deploy the contract before each test
  beforeEach(async function () {
    [owner, recipient, hacker] = await ethers.getSigners();
    const TridenToken = await ethers.getContractFactory("TridenToken", owner);

    token = await TridenToken.deploy();
    await token.waitForDeployment();
  });
  
  it("should initialize correctly", async function () {
      expect(await token.totalSupply()).to.equal(ethers.parseUnits("5000000000", 18));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("5000000000", 18));
  });

  it("should transfer tokens successfully", async function () {
    const initialOwnerBalance = await token.balanceOf(owner.address);
    const transferAmount = ethers.parseUnits("100", 18);

    await token.transfer(recipient.address, transferAmount);

    expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance - transferAmount);
    expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
  });

  it("shouldn't allow to transfer more than available balance", async function () {
    let balance = await token.balanceOf(owner.address);
    await expect(token.transfer(recipient.address, balance + 1n)).to.be.reverted;
  });

  it("shouldn't transfer tokens without previous approval", async function () {
    const amount = ethers.parseUnits("1", 18);
    await expect(token.connect(recipient).transferFrom(owner.address, hacker.address, amount)).to.be.reverted;
  });

  it("should transfer only approved tokens", async function () {
    const balance = await token.balanceOf(owner.address);
    const amount = ethers.parseUnits("1", 18);

    await token.approve(recipient.address, amount);
    await token.connect(recipient).transferFrom(owner.address, hacker.address, amount);

    expect(await token.balanceOf(hacker.address)).to.equal(amount);
    expect(await token.balanceOf(owner.address)).to.equal(balance - amount);
    expect(await token.allowance(owner.address, recipient.address)).to.equal(0);
  });

  it("shouldn't allow non-owners to mint tokens", async function () {
    await expect(token.connect(hacker).mint(100)).to.be.reverted;
  });

  it("shouldn't allow non-owners to burn tokens", async function () {
    await expect(token.connect(hacker).burn(100)).to.be.reverted;
  });

  it("should allow owner to mint tokens", async function () {
    const supply = await token.totalSupply();
    const balance = await token.balanceOf(owner.address);
    const amount = ethers.parseUnits("100", 18);

    await token.mint(amount);
  
    expect(await token.totalSupply()).to.equal(supply + amount);
    expect(await token.balanceOf(owner.address)).to.equal(balance + amount);
  });

  it("should allow to set new owner", async function () {
    await token.transferOwnership(recipient.address);
    expect(await token.owner()).to.equal(recipient.address);
  });

  it("should allow owner to burn tokens", async function () {
    const supply = await token.totalSupply();
    const balance = await token.balanceOf(owner.address);
    const amount = ethers.parseUnits("100", 18);

    await token.burn(amount);
  
    expect(await token.totalSupply()).to.equal(supply - amount);
    expect(await token.balanceOf(owner.address)).to.equal(balance - amount);
  });
});
