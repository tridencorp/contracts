const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Presale", function () {
  let token;
  let presale;
  let owner;
  let recipient;

  // Deploy contracts
  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();

    const TridenToken = await ethers.getContractFactory("TridenToken", owner);
    token = await TridenToken.deploy();

    const Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy();
    await presale.connect(owner).setTokenAddress(token.target);

    const initialSupply = ethers.parseUnits("5000000", 18);
    await token.connect(owner).transfer(presale.target, initialSupply);
  });
  
  describe("receive", function () {
    it("should transfer equivalent of 1 ETH", async function () {
      const recipientBalance = await token.balanceOf(recipient.address);
      expect(recipientBalance).to.equal(0);

      let value = ethers.parseEther("1", 18)  

      await recipient.sendTransaction({to: presale.target, value: value});
      expect(await token.balanceOf(recipient.address)).to.equal(178_000);    
    })

    it("should check if MIN amount is send", async function () {
      // Sending less than min amount
      await expect(
        recipient.sendTransaction({ to: presale.target, value: BigInt(1e18) / 178000n })
      ).to.be.revertedWith("Not enough ETH");
    })

    it("should revert if contract is not active", async function () {
      await presale.connect(owner).setActive(false);

      await expect(
        recipient.sendTransaction({ to: presale.target, value: BigInt(10n) })
      ).to.be.revertedWith("Presale is not active");
    })
  })
  
  describe("owner", function () {
    it("is allow to set active flag", async function () {
      await presale.connect(owner).setActive(false);
      expect(await presale.active()).to.equal(false);

      await presale.connect(owner).setActive(true);
      expect(await presale.active()).to.equal(true);
    });

    it("is allow to set token address", async function () {
      await presale.connect(owner).setTokenAddress(owner.address);
      expect(await presale.tridenToken()).to.equal(owner.address);
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
      expect(await presale.tokenPrice()).to.equal(price);
    });
  })

  describe("not an owner", function () {
    it("is not allow to set token price", async function () {
      await expect(
        presale.connect(recipient).setTokenPrice(1000n, 10)
      ).to.be.revertedWith("You are not the owner");
    });

    it("is not allow withdraw ETH", async function () {
      await expect(
        presale.connect(recipient).withdrawETH()
      ).to.be.revertedWith("You are not the owner");
    });

    it("is not allow withdraw tokens", async function () {
      await expect(
        presale.connect(recipient).withdrawTokens(10n)
      ).to.be.revertedWith("You are not the owner");
    });

    it("is not allow to set active flag", async function () {
      await expect(
        presale.connect(recipient).setActive(false)
      ).to.be.revertedWith("You are not the owner");
    });

    it("is not allow to set token address", async function () {
      await expect(
        presale.connect(recipient).setTokenAddress(recipient.address)
      ).to.be.revertedWith("You are not the owner");
    });
  });
});
