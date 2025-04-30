const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Presale", function () {
  let token;
  let presale;
  let owner;
  let recipient;
  let hacker;

  // Deploy contracts
  beforeEach(async function () {
    [owner, recipient, hacker] = await ethers.getSigners();

    const TridenToken = await ethers.getContractFactory("TridenToken", owner);
    token = await TridenToken.deploy();

    const Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy(token.target);

    const initialSupply = ethers.parseUnits("5000000", 18);
    await token.transfer(presale.target, initialSupply);
  });

  // TODO: split this one
  it("should transfer correct number of tokens", async function () {
    const recipientBalance = await token.balanceOf(recipient.address);
    expect(recipientBalance).to.equal(0);

    // Sending 1 ETH
    let value = ethers.parseEther("1", 18)  

    await recipient.sendTransaction({to: presale.target, value: value});
    expect(await token.balanceOf(recipient.address)).to.equal(178_000);

    // Sending less than min amount.
    value = BigInt(1e18) / 178000n;
    await expect(
      recipient.sendTransaction({ to: presale.target, value: value })
    ).to.be.reverted;

    // Sending min amount.
    value = 500n * (BigInt(1e18) / 178000n);

    await recipient.sendTransaction({to: presale.target, value: value})
    expect(await token.balanceOf(recipient.address)).to.equal(178_500);    
  });

  describe("owner", function () {
    it("is allow to set active flag", async function () {
      await presale.connect(owner).setActive(false);

      await expect(
        recipient.sendTransaction({ to: presale.target, value: 0 })
      ).to.be.revertedWith("Presale is not active");

      let value = ethers.parseEther("1", 18)  
      await presale.connect(owner).setActive(true);
      await recipient.sendTransaction({ to: presale.target, value: value });

      // TODO: Not to be reverted
      expect(await token.balanceOf(recipient.address)).to.equal(178_000);
    });

    it("is allow to withdraw ETH", async function () {
      const balanceBefore = await ethers.provider.getBalance(owner.address);

      let value = ethers.parseEther("1", 18)  
      await recipient.sendTransaction({ to: presale.target, value: value });

      await presale.connect(owner).withdrawETH();

      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceBefore).to.be.lessThan(balanceAfter);
    });

    it("is allow to withdraw tokens", async function () {
      const ownerBalanceBefore = await token.balanceOf(owner.address);

      const presaleBefore = await token.balanceOf(presale.target);
      await presale.connect(owner).withdrawTokens(presaleBefore);

      const presaleAfter = await token.balanceOf(presale.target);
      expect(presaleAfter).to.equal(0);

      const ownerBalanceAfter = await token.balanceOf(owner.address);
      expect(ownerBalanceBefore).to.be.lessThan(ownerBalanceAfter);
    });

    it("is allow to set token price", async function () {
      // Change token price from $0.01 to $1
      const price = BigInt(1e18) / 1780n;
      await presale.connect(owner).setTokenPrice(price, 10);

      let value = BigInt(1e18);
      await recipient.sendTransaction({ to: presale.target, value: value });
      expect(await token.balanceOf(recipient.address)).to.equal(1780);
    });
  })

  describe("not owner", function () {
  });
});
