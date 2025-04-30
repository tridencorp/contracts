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

    const initialSupply = ethers.parseUnits("50000000", 18); // $500_000
    await token.transfer(presale.target, initialSupply);
  });

  it("should transfer correct number of tokens", async function () {
    const recipientBalance = await token.balanceOf(recipient.address);
    expect(recipientBalance).to.equal(0);

    // Sending 1 ETH
    let address = presale.target;
    let value = ethers.parseEther("1", 18)  

    await recipient.sendTransaction({to: address, value: value});
    expect(await token.balanceOf(recipient.address)).to.equal(178_000);

    // Sending less than min amount.
    value = 1000000000000000000n / 178000n;
    await expect(
      recipient.sendTransaction({ to: address, value: value })
    ).to.be.reverted;

    // Sending min amount.
    value = 500n * (1000000000000000000n / 178000n);

    await recipient.sendTransaction({to: address, value: value})
    expect(await token.balanceOf(recipient.address)).to.equal(178_500);    
  });
  
  describe("owner", function () {
    it("is allow to set active flag", async function () {
      await presale.connect(owner).setActive(false);

      let address = presale.target;
      let value = ethers.parseEther("1", 18)  

      await expect(
        recipient.sendTransaction({ to: address, value: value })
      ).to.be.reverted;

      await presale.connect(owner).setActive(true);
      await recipient.sendTransaction({ to: address, value: value });

      expect(await token.balanceOf(recipient.address)).to.equal(178_000);
    });

    it("is allow to withdraw ETH", async function () {
      const ownerBalance = await ethers.provider.getBalance(owner.address);

      let address = presale.target;
      let value = ethers.parseEther("1", 18)  
      await recipient.sendTransaction({ to: address, value: value });

      await presale.connect(owner).withdrawETH();

      const newBalance = await ethers.provider.getBalance(owner.address);
      console.log(newBalance - ownerBalance);
      expect(ownerBalance).to.be.lessThan(newBalance);
    });

    it("is allow to withdraw tokens", async function () {
    });

    it("is allow to set token price", async function () {
    });
  })
});
