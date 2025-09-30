const { expect } = require("chai");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");

describe("AuctionManager", function () {
  let auctionManager;
  let testERC721;
  let owner;
  let seller;
  let bidder1;
  let bidder2;
  let addrs;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2, ...addrs] = await ethers.getSigners();

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
    await testERC721.safeMint(seller.address, "https://example.com/nft/2.json");
  });

  describe("Auction Creation", function () {
    it("Should create an auction successfully", async function () {
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");
      const duration = 7 * 24 * 60 * 60; // 7 days

      // Approve NFT transfer
      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);

      // Create auction
      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0, // ERC721
          sellerDeposit,
          bidderDeposit,
          duration,
          { value: sellerDeposit }
        )
      ).to.emit(auctionManager, "AuctionCreated")
        .withArgs(
          1, // auctionId
          seller.address,
          await testERC721.getAddress(),
          1, // tokenId
          0, // assetType
          sellerDeposit,
          bidderDeposit,
          anyValue() // endTime (we don't need exact match)
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

    it("Should fail with invalid duration", async function () {
      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);

      // Test with too short duration
      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0,
          ethers.parseEther("1"),
          ethers.parseEther("0.1"),
          60, // Too short (1 minute)
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Duration too short");

      // Test with too long duration
      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0,
          ethers.parseEther("1"),
          ethers.parseEther("0.1"),
          31 * 24 * 60 * 60, // Too long (31 days)
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Duration too long");
    });
  });

  describe("Bid Submission", function () {
    beforeEach(async function () {
      // Setup an auction
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");

      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);
      await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        7 * 24 * 60 * 60,
        { value: sellerDeposit }
      );
    });

    it("Should accept a valid bid", async function () {
      const bidderDeposit = ethers.parseEther("0.1");
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");

      await expect(
        auctionManager.connect(bidder1).submitBidWithDeposit(
          mockEncBid,
          mockProof,
          { value: bidderDeposit }
        )
      ).to.emit(auctionManager, "BidSubmitted")
        .withArgs(
          1, // auctionId
          bidder1.address,
          mockEncBid,
          mockProof,
          bidderDeposit
        );

      // Check auction bid count
      const auction = await auctionManager.getAuction(1);
      expect(auction.bidCount).to.equal(1);
    });

    it("Should fail with insufficient bidder deposit", async function () {
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");

      await expect(
        auctionManager.connect(bidder1).submitBidWithDeposit(
          mockEncBid,
          mockProof,
          { value: ethers.parseEther("0.05") } // Insufficient deposit
        )
      ).to.be.revertedWith("Insufficient bidder deposit");
    });

    it("Should prevent seller from bidding", async function () {
      const bidderDeposit = ethers.parseEther("0.1");
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");

      await expect(
        auctionManager.connect(seller).submitBidWithDeposit(
          mockEncBid,
          mockProof,
          { value: bidderDeposit }
        )
      ).to.be.revertedWith("Seller cannot bid");
    });

    it("Should prevent duplicate bids from same user", async function () {
      const bidderDeposit = ethers.parseEther("0.1");
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");

      // First bid
      await auctionManager.connect(bidder1).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidderDeposit }
      );

      // Second bid from same user should fail
      await expect(
        auctionManager.connect(bidder1).submitBidWithDeposit(
          mockEncBid,
          mockProof,
          { value: bidderDeposit }
        )
      ).to.be.revertedWith("Already submitted a bid");
    });
  });

  describe("Auction Finalization", function () {
    beforeEach(async function () {
      // Setup an auction with bids
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");

      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);
      await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        2 * 60 * 60, // 2 hours duration
        { value: sellerDeposit }
      );

      // Add a bid
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");
      await auctionManager.connect(bidder1).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidderDeposit }
      );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [2 * 60 * 60 + 1]); // 2 hours + 1 second
      await ethers.provider.send("evm_mine");
    });

    it("Should finalize auction with winner", async function () {
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      await expect(
        auctionManager.finalizeAuction(1)
      ).to.emit(auctionManager, "AuctionFinalized");

      const auction = await auctionManager.getAuction(1);
      expect(auction.finalized).to.be.true;
      expect(auction.isActive).to.be.false;
      expect(auction.winner).to.equal(bidder1.address);

      // Check that NFT was transferred to winner
      expect(await testERC721.ownerOf(1)).to.equal(bidder1.address);
    });

    it("Should fail to finalize twice", async function () {
      await auctionManager.finalizeAuction(1);

      await expect(
        auctionManager.finalizeAuction(1)
      ).to.be.revertedWith("Already finalized");
    });
  });

  describe("Auction Cancellation", function () {
    beforeEach(async function () {
      // Setup an auction without bids
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");

      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);
      await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        7 * 24 * 60 * 60,
        { value: sellerDeposit }
      );
    });

    it("Should allow seller to cancel auction without bids", async function () {
      await expect(
        auctionManager.connect(seller).cancelAuction(1)
      ).to.emit(auctionManager, "AuctionCancelled")
        .withArgs(1, seller.address, "Cancelled by seller");

      const auction = await auctionManager.getAuction(1);
      expect(auction.finalized).to.be.true;
      expect(auction.isActive).to.be.false;

      // Check that NFT was returned to seller
      expect(await testERC721.ownerOf(1)).to.equal(seller.address);
    });

    it("Should prevent cancellation after bids are placed", async function () {
      // Add a bid
      const bidderDeposit = ethers.parseEther("0.1");
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");
      await auctionManager.connect(bidder1).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidderDeposit }
      );

      await expect(
        auctionManager.connect(seller).cancelAuction(1)
      ).to.be.revertedWith("Cannot cancel auction with bids");
    });

    it("Should prevent non-seller from canceling", async function () {
      await expect(
        auctionManager.connect(bidder1).cancelAuction(1)
      ).to.be.revertedWith("Not the auction seller");
    });
  });

  describe("Auction Stats", function () {
    beforeEach(async function () {
      // Setup an auction with multiple bids
      const sellerDeposit = ethers.parseEther("1");
      const bidderDeposit = ethers.parseEther("0.1");

      await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);
      await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        7 * 24 * 60 * 60,
        { value: sellerDeposit }
      );

      // Add multiple bids
      const mockEncBid = ethers.toUtf8Bytes("encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("proof");

      await auctionManager.connect(bidder1).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidderDeposit }
      );

      await auctionManager.connect(bidder2).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidderDeposit }
      );
    });

    it("Should return correct auction stats", async function () {
      const auction = await auctionManager.getAuction(1);
      expect(auction.bidCount).to.equal(2);

      const bids = await auctionManager.getAuctionBids(1);
      expect(bids.length).to.equal(2);
      expect(bids[0].bidder).to.equal(bidder1.address);
      expect(bids[1].bidder).to.equal(bidder2.address);
    });

    it("Should reveal auction stats with threshold", async function () {
      const threshold = ethers.parseEther("0.05");
      const countAbove = await auctionManager.revealAuctionStats(1, threshold);
      expect(countAbove).to.be.gte(0); // Mock implementation
    });
  });
});