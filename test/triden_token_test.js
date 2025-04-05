const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleERC20", function () {
  let token;
  let owner;
  let addr1;
  let addr2;

  // Deploy the contract before each test
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TridenToken = await ethers.getContractFactory("TridenToken", owner);

    token = await TridenToken.deploy();
    await token.waitForDeployment();
  });

  it("should transfer tokens successfully", async function () {
    const initialOwnerBalance = await token.balanceOf(owner.address);
    const transferAmount = ethers.parseUnits("100", 18);

    // Transfer 100 tokens from owner to addr1
    await token.transfer(addr1.address, transferAmount);

    // Check balances
    expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance - transferAmount);
    expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);
  });
});