import { expect } from "chai";
import { ethers } from "hardhat";
import { AuctionManager } from "../typechain-types";
import { TestERC721 } from "../typechain-types";

describe("AuctionManager", function () {
  let auctionManager: AuctionManager;
  let testERC721: TestERC721;
  let owner: any;
  let seller: any;
  let bidder1: any;
  let bidder2: any;
  let auctionId: bigint;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy TestERC721
    const TestERC721 = await ethers.getContractFactory("TestERC721");
    testERC721 = await TestERC721.deploy("Test NFT", "TEST") as TestERC721;
    await testERC721.waitForDeployment();

    // Deploy AuctionManager
    const AuctionManager = await ethers.getContractFactory("AuctionManager");
    auctionManager = await AuctionManager.deploy() as AuctionManager;
    await auctionManager.waitForDeployment();

    // Mint NFT for testing
    await testERC721.mint(seller.address);
    await testERC721.connect(seller).approve(await auctionManager.getAddress(), 1);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await auctionManager.owner()).to.equal(owner.address);
    });

    it("Should set next auction ID to 1", async function () {
      expect(await auctionManager.nextAuctionId()).to.equal(1n);
    });
  });

  describe("Auction Creation", function () {
    it("Should create auction with valid parameters", async function () {
      const sellerDeposit = ethers.parseEther("0.5");
      const bidderDeposit = ethers.parseEther("0.05");
      const duration = 86400; // 24 hours

      const tx = await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0, // ERC721
        sellerDeposit,
        bidderDeposit,
        duration,
        { value: sellerDeposit }
      );

      await tx.wait();
      auctionId = await auctionManager.nextAuctionId() - 1n;

      expect(auctionId).to.equal(0n);

      const auction = await auctionManager.getAuction(auctionId);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.assetContract).to.equal(await testERC721.getAddress());
      expect(auction.tokenId).to.equal(1n);
      expect(auction.sellerDeposit).to.equal(sellerDeposit);
      expect(auction.bidderDeposit).to.equal(bidderDeposit);
      expect(auction.isActive).to.be.true;
      expect(auction.finalized).to.be.false;
      expect(auction.bidCount).to.equal(0n);
    });

    it("Should fail with insufficient seller deposit", async function () {
      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0,
          ethers.parseEther("0.1"), // Too low
          ethers.parseEther("0.05"),
          86400,
          { value: ethers.parseEther("0.1") }
        )
      ).to.be.revertedWith("Insufficient seller deposit");
    });

    it("Should fail with zero deposits", async function () {
      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0,
          0,
          0,
          86400,
          { value: 0 }
        )
      ).to.be.revertedWith("Seller deposit must be > 0");
    });

    it("Should fail with invalid duration", async function () {
      await expect(
        auctionManager.connect(seller).createAuction(
          await testERC721.getAddress(),
          1,
          0,
          ethers.parseEther("0.5"),
          ethers.parseEther("0.05"),
          100, // Too short (less than 1 hour)
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Duration too short");
    });

    it("Should fail if not token owner", async function () {
      // Mint NFT to different address
      await testERC721.mint(bidder1.address);

      await expect(
        auctionManager.connect(bidder1).createAuction(
          await testERC721.getAddress(),
          2, // Different token ID
          0,
          ethers.parseEther("0.5"),
          ethers.parseEther("0.05"),
          86400,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Not token owner");
    });
  });

  describe("Bid Submission", function () {
    beforeEach(async function () {
      // Create an auction for bidding tests
      const sellerDeposit = ethers.parseEther("0.5");
      const bidderDeposit = ethers.parseEther("0.05");

      const tx = await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        86400,
        { value: sellerDeposit }
      );
      await tx.wait();
      auctionId = await auctionManager.nextAuctionId() - 1n;
    });

    it("Should submit bid successfully", async function () {
      const bidAmount = ethers.parseEther("1.0");
      const mockEncryptedBid = ethers.toUtf8Bytes("test_encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("test_proof");

      const tx = await auctionManager.connect(bidder1).submitBidWithDeposit(
        auctionId,
        mockEncryptedBid,
        mockProof,
        { value: bidAmount }
      );

      await tx.wait();

      const auction = await auctionManager.getAuction(auctionId);
      expect(auction.bidCount).to.equal(1n);

      const bids = await auctionManager.getAuctionBids(auctionId);
      expect(bids.length).to.equal(1);
      expect(bids[0].bidder).to.equal(bidder1.address);
      expect(bids[0].depositAmount).to.equal(bidAmount);
    });

    it("Should fail with insufficient bidder deposit", async function () {
      const bidAmount = ethers.parseEther("0.01"); // Too low
      const mockEncryptedBid = ethers.toUtf8Bytes("test_encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("test_proof");

      await expect(
        auctionManager.connect(bidder2).submitBidWithDeposit(
          auctionId,
          mockEncryptedBid,
          mockProof,
          { value: bidAmount }
        )
      ).to.be.revertedWith("Insufficient bidder deposit");
    });

    it("Should fail if seller tries to bid", async function () {
      const bidAmount = ethers.parseEther("1.0");
      const mockEncryptedBid = ethers.toUtf8Bytes("test_encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("test_proof");

      await expect(
        auctionManager.connect(seller).submitBidWithDeposit(
          auctionId,
          mockEncryptedBid,
          mockProof,
          { value: bidAmount }
        )
      ).to.be.revertedWith("Seller cannot bid");
    });

    it("Should fail if user already bid", async function () {
      const bidAmount = ethers.parseEther("1.0");
      const mockEncryptedBid = ethers.toUtf8Bytes("test_encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("test_proof");

      // First bid
      await auctionManager.connect(bidder1).submitBidWithDeposit(
        auctionId,
        mockEncryptedBid,
        mockProof,
        { value: bidAmount }
      );

      // Second bid from same user should fail
      await expect(
        auctionManager.connect(bidder1).submitBidWithDeposit(
          auctionId,
          mockEncryptedBid,
          mockProof,
          { value: bidAmount }
        )
      ).to.be.revertedWith("Already submitted a bid");
    });
  });

  describe("Auction Finalization", function () {
    beforeEach(async function () {
      // Create an auction and submit a bid
      const sellerDeposit = ethers.parseEther("0.5");
      const bidderDeposit = ethers.parseEther("0.05");

      let tx = await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        sellerDeposit,
        bidderDeposit,
        86400,
        { value: sellerDeposit }
      );
      await tx.wait();
      auctionId = await auctionManager.nextAuctionId() - 1n;

      // Submit bid
      const bidAmount = ethers.parseEther("1.0");
      const mockEncryptedBid = ethers.toUtf8Bytes("test_encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("test_proof");

      tx = await auctionManager.connect(bidder1).submitBidWithDeposit(
        auctionId,
        mockEncryptedBid,
        mockProof,
        { value: bidAmount }
      );
      await tx.wait();

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", ["0x1"]);
    });

    it("Should finalize auction after end time", async function () {
      const tx = await auctionManager.finalizeAuction(auctionId);
      await tx.wait();

      const auction = await auctionManager.getAuction(auctionId);
      expect(auction.finalized).to.be.true;
      expect(auction.isActive).to.be.false;
      expect(auction.winner).to.equal(bidder1.address);
    });

    it("Should fail to finalize before end time", async function () {
      // Create a new auction
      const tx = await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        2,
        0,
        ethers.parseEther("0.5"),
        ethers.parseEther("0.05"),
        86400,
        { value: ethers.parseEther("0.5") }
      );
      await tx.wait();
      const newAuctionId = await auctionManager.nextAuctionId() - 1n;

      await expect(
        auctionManager.finalizeAuction(newAuctionId)
      ).to.be.revertedWith("Auction still active");
    });

    it("Should fail to finalize already finalized auction", async function () {
      await auctionManager.finalizeAuction(auctionId);

      await expect(
        auctionManager.finalizeAuction(auctionId)
      ).to.be.revertedWith("Already finalized");
    });
  });

  describe("Auction Cancellation", function () {
    beforeEach(async function () {
      // Create an auction without bids
      const tx = await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        2,
        0,
        ethers.parseEther("0.5"),
        ethers.parseEther("0.05"),
        86400,
        { value: ethers.parseEther("0.5") }
      );
      await tx.wait();
      auctionId = await auctionManager.nextAuctionId() - 1n;
    });

    it("Should cancel auction by seller", async function () {
      const tx = await auctionManager.connect(seller).cancelAuction(auctionId);
      await tx.wait();

      const auction = await auctionManager.getAuction(auctionId);
      expect(auction.finalized).to.be.true;
      expect(auction.isActive).to.be.false;
    });

    it("Should fail to cancel auction with bids", async function () {
      // Submit a bid first
      const bidAmount = ethers.parseEther("1.0");
      const mockEncryptedBid = ethers.toUtf8Bytes("test_encrypted_bid");
      const mockProof = ethers.toUtf8Bytes("test_proof");

      await auctionManager.connect(bidder1).submitBidWithDeposit(
        auctionId,
        mockEncryptedBid,
        mockProof,
        { value: bidAmount }
      );

      await expect(
        auctionManager.connect(seller).cancelAuction(auctionId)
      ).to.be.revertedWith("Cannot cancel auction with bids");
    });

    it("Should fail to cancel auction if not seller", async function () {
      await expect(
        auctionManager.connect(bidder1).cancelAuction(auctionId)
      ).to.be.revertedWith("Not the auction seller");
    });
  });

  describe("View Functions", function () {
    it("Should return user auctions", async function () {
      const userAuctions = await auctionManager.getUserAuctions(seller.address);
      expect(Array.isArray(userAuctions)).to.be.true;
    });

    it("Should return auction details", async function () {
      // Create an auction first
      const tx = await auctionManager.connect(seller).createAuction(
        await testERC721.getAddress(),
        1,
        0,
        ethers.parseEther("0.5"),
        ethers.parseEther("0.05"),
        86400,
        { value: ethers.parseEther("0.5") }
      );
      await tx.wait();
      auctionId = await auctionManager.nextAuctionId() - 1n;

      const auction = await auctionManager.getAuction(auctionId);
      expect(auction.auctionId).to.equal(auctionId);
      expect(auction.seller).to.equal(seller.address);
    });
  });
});