const { ethers } = require("hardhat");
const { expect } = require("chai");
const { NomicLabsHardhatPluginError } = require("hardhat/plugins");

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

  it("should transfer tokens successfully", async function () {
    const initialOwnerBalance = await token.balanceOf(owner.address);
    const transferAmount = ethers.parseUnits("100", 18);

    await token.transfer(recipient.address, transferAmount);

    expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance - transferAmount);
    expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
  });

  it("should not allow to transfer more than available balance", async function () {
    let balance = await token.balanceOf(owner.address);

    balance += 1n;
    await expect(token.transfer(recipient.address, balance)).to.be.reverted;
  });
});
