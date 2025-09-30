const { ethers } = require("hardhat");

async function main() {
  console.log("Starting interaction script...\n");

  // Get signers
  const [deployer, bidder1, bidder2] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Bidder 1:", bidder1.address);
  console.log("Bidder 2:", bidder2.address);

  // Contract addresses (update these after deployment)
  const AUCTION_MANAGER_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // Deployed AuctionManager address
  const TEST_ERC721_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Deployed TestERC721 address

  // Get contract instances
  const AuctionManager = await ethers.getContractFactory("AuctionManager");
  const auctionManager = AuctionManager.attach(AUCTION_MANAGER_ADDRESS);

  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const testERC721 = TestERC721.attach(TEST_ERC721_ADDRESS);

  try {
    // Check if auction exists
    console.log("\n=== Checking Auction Status ===");
    const auction = await auctionManager.getAuction(1);
    console.log("Auction 1 exists:", auction.seller !== ethers.ZeroAddress);

    if (auction.seller !== ethers.ZeroAddress) {
      console.log("Current Auction Details:");
      console.log("- Seller:", auction.seller);
      console.log("- Token ID:", auction.tokenId.toString());
      console.log("- End Time:", new Date(Number(auction.endTime) * 1000).toLocaleString());
      console.log("- Is Active:", auction.isActive);
      console.log("- Bid Count:", auction.bidCount.toString());

      // Simulate bidding
      console.log("\n=== Simulating Bids ===");

      // Bidder 1 submits a bid
      console.log("Bidder 1 submitting bid...");
      const bidder1Deposit = await auctionManager.bidderDeposit(1);
      const mockEncBid = "0x1234567890abcdef"; // Mock encrypted bid
      const mockProof = "0xabcdef1234567890";   // Mock proof

      const bid1Tx = await auctionManager.connect(bidder1).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidder1Deposit }
      );
      await bid1Tx.wait();
      console.log("Bidder 1 bid submitted successfully");

      // Bidder 2 submits a bid
      console.log("Bidder 2 submitting bid...");
      const bid2Tx = await auctionManager.connect(bidder2).submitBidWithDeposit(
        mockEncBid,
        mockProof,
        { value: bidder1Deposit }
      );
      await bid2Tx.wait();
      console.log("Bidder 2 bid submitted successfully");

      // Check updated auction status
      const updatedAuction = await auctionManager.getAuction(1);
      console.log("\nUpdated Bid Count:", updatedAuction.bidCount.toString());

      // Get auction bids
      const bids = await auctionManager.getAuctionBids(1);
      console.log("Total Bids:", bids.length);

      // Reveal auction stats (mock)
      console.log("\n=== Revealing Auction Stats ===");
      const threshold = ethers.parseEther("0.5"); // 0.5 ETH threshold
      const countAbove = await auctionManager.revealAuctionStats(1, threshold);
      console.log("Bids above threshold:", countAbove.toString());

      // Finalize the auction (if time has passed or for testing)
      console.log("\n=== Finalizing Auction ===");
      try {
        const finalizeTx = await auctionManager.finalizeAuction(1);
        await finalizeTx.wait();
        console.log("Auction finalized successfully");

        const finalAuction = await auctionManager.getAuction(1);
        console.log("Winner:", finalAuction.winner);
        console.log("Winning Bid:", ethers.formatEther(finalAuction.winningBid), "ETH");
      } catch (error) {
        console.log("Cannot finalize auction yet:", error.message);
        console.log("This is expected if the auction duration hasn't passed");
      }
    } else {
      console.log("No auction found. Please run deploy.js first.");
    }

  } catch (error) {
    console.error("Error during interaction:", error.message);
  }

  console.log("\n=== Interaction Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction failed:", error);
    process.exit(1);
  });