const { ethers } = require("hardhat");

async function main() {
  console.log("Starting simple interaction script...\n");

  // Get signers
  const [deployer, bidder1, bidder2] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Bidder 1:", bidder1.address);
  console.log("Bidder 2:", bidder2.address);

  // Contract addresses from deployment
  const AUCTION_MANAGER_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const TEST_ERC721_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  try {
    // Get contract instances
    const AuctionManager = await ethers.getContractFactory("AuctionManager");
    const auctionManager = AuctionManager.attach(AUCTION_MANAGER_ADDRESS);

    const TestERC721 = await ethers.getContractFactory("TestERC721");
    const testERC721 = TestERC721.attach(TEST_ERC721_ADDRESS);

    console.log("\n=== Checking Contract Status ===");

    // Check if auction exists
    try {
      const auction = await auctionManager.getAuction(1);

      if (auction.seller !== ethers.ZeroAddress) {
        console.log("✅ Auction 1 found!");
        console.log("Seller:", auction.seller);
        console.log("Token ID:", auction.tokenId.toString());
        console.log("Is Active:", auction.isActive);
        console.log("Bid Count:", auction.bidCount.toString());

        // Check NFT ownership
        try {
          const owner = await testERC721.ownerOf(1);
          console.log("Current NFT Owner:", owner);
        } catch (error) {
          console.log("❌ Could not get NFT owner:", error.message);
        }

        // Get contract details
        console.log("\n=== Contract Details ===");
        console.log("AuctionManager Address:", AUCTION_MANAGER_ADDRESS);
        console.log("TestERC721 Address:", TEST_ERC721_ADDRESS);

        // Check deployer balance
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log("Deployer Balance:", ethers.formatEther(balance), "ETH");

        // Get auction bids if any
        try {
          const bids = await auctionManager.getAuctionBids(1);
          console.log("Number of bids:", bids.length);
        } catch (error) {
          console.log("Could not get bids:", error.message);
        }

      } else {
        console.log("❌ No auction found. Please run deploy.js first.");
      }
    } catch (error) {
      console.log("❌ Error checking auction:", error.message);
      console.log("Make sure contracts are deployed on the current network.");
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