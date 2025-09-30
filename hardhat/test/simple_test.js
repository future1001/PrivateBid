const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionManager - Simple Tests", function () {
  let auctionManager;
  let testERC721;
  let owner;
  let seller;
  let bidder1;
  let addrs;

  beforeEach(async function () {
    [owner, seller, bidder1, ...addrs] = await ethers.getSigners();

    // Deploy TestERC721
    const TestERC721 = await ethers.getContractFactory("TestERC721");
    testERC721 = await TestERC721.deploy();
    await testERC721.waitForDeployment();

    // Deploy AuctionManager
    const AuctionManager = await ethers.getContractFactory("AuctionManager");
    auctionManager = await AuctionManager.deploy();
    await auctionManager.waitForDeployment();

    // Mint NFTs to seller
    await testERC721.safeMint(seller.address, "https://example.com/nft/1.json");
  });

  describe("Basic Functionality", function () {
    it("Should deploy contracts successfully", async function () {
      expect(await testERC721.getAddress()).to.be.properAddress;
      expect(await auctionManager.getAddress()).to.be.properAddress;
    });

    it("Should create an auction successfully", async function () {
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");
      const duration = 7 * 24 * 60 * 60; // 7 days

      // Approve NFT transfer
      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);

      // Create auction
      await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0, // ERC721
        sellerDeposit,
        bidderDeposit,
        duration,
        { value: sellerDeposit }
      );

      // Check auction details
      const auction = await auctionManager.getAuction(1);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.assetContract).to.equal(await testERC721.getAddress());
      expect(auction.tokenId).to.equal(1);
      expect(auction.isActive).to.be.true;
      expect(auction.finalized).to.be.false;
    });

    it("Should fail with insufficient seller deposit", async function () {
      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);

      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0,
          ethers.parseEther("1"),
          ethers.parseEther("0.1"),
          7 * 24 * 60 * 60,
          { value: ethers.parseEther("0.5") } // Insufficient deposit
        )
      ).to.be.revertedWith("Insufficient seller deposit");
    });

    it("Should allow seller to cancel auction without bids", async function () {
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");
      const duration = 7 * 24 * 60 * 60;

      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);

      await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        duration,
        { value: sellerDeposit }
      );

      await expect(
        auctionManager.connect(seller).cancelAuction(1)
      ).to.emit(auctionManager, "AuctionCancelled");
    });
  });
});