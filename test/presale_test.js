const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Presale", function () {
  let token;
  let presale;
  let owner;
  let recipient;
  let hacker;

  const tokenPriceInUSDWei = ethers.parseUnits("0.01", 18); // 0.01 USD
  const ethPriceInUSDWei = ethers.parseUnits("1700", 18); // ETH price in USD
  const initialSupply = ethers.parseUnits("50000000", 18); // $500k

  // Deploy contracts
  beforeEach(async function () {
    [owner, recipient, hacker] = await ethers.getSigners();

    const TridenToken = await ethers.getContractFactory("TridenToken", owner);
    token = await TridenToken.deploy();

    const Presale = await ethers.getContractFactory("Presale");
    presale = await Presale.deploy(token.target);

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

    // Sending less than min value.
    value = 1000000000000000000n / 178000n;
    await expect(recipient.sendTransaction({to: address, value: value})).to.be.reverted;

    // Sending min value.
    value = 500n * (1000000000000000000n / 178000n);

    await recipient.sendTransaction({to: address, value: value})
    expect(await token.balanceOf(recipient.address)).to.equal(178_500);    
  });
  
  describe("owner", function () {
    it("is allow to set active flag", async function () {
      await presale.connect(owner).setActive(false);

      let address = presale.target;
      let value = ethers.parseEther("1", 18)  

      await expect(recipient.sendTransaction({ to: address, value: value })).to.be.reverted;

      await presale.connect(owner).setActive(true);
      await recipient.sendTransaction({ to: address, value: value });
      expect(await token.balanceOf(recipient.address)).to.equal(178_000);
    });  
  })
});
