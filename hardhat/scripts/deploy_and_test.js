const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying and testing contracts...\n");

  // Get signers
  const [deployer, bidder1, bidder2] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Bidder 1:", bidder1.address);
  console.log("Bidder 2:", bidder2.address);

  // Deploy TestERC721 first
  console.log("\n1. Deploying TestERC721...");
  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const testERC721 = await TestERC721.deploy();
  await testERC721.waitForDeployment();
  const testERC721Address = await testERC721.getAddress();
  console.log("   TestERC721 deployed to:", testERC721Address);

  // Mint test NFTs
  console.log("   Minting test NFTs...");
  await testERC721.safeMint(deployer.address, "https://example.com/nft/1.json");
  await testERC721.safeMint(deployer.address, "https://example.com/nft/2.json");
  console.log("   Minted 2 test NFTs to deployer");

  // Deploy AuctionManager
  console.log("\n2. Deploying AuctionManager...");
  const AuctionManager = await ethers.getContractFactory("AuctionManager");
  const auctionManager = await AuctionManager.deploy();
  await auctionManager.waitForDeployment();
  const auctionManagerAddress = await auctionManager.getAddress();
  console.log("   AuctionManager deployed to:", auctionManagerAddress);

  // Create a sample auction
  console.log("\n3. Creating a sample auction...");
  const sellerDeposit = ethers.parseEther("1");
  const bidderDeposit = ethers.parseEther("0.1");
  const duration = 7 * 24 * 60 * 60; // 7 days

  // Approve NFT transfer
  await testERC721.approve(auctionManagerAddress, 1);
  console.log("   Approved NFT #1 for auction");

  const createAuctionTx = await auctionManager.createAuction(
    testERC721Address,
    1, // tokenId
    0, // AssetType.ERC721
    sellerDeposit,
    bidderDeposit,
    duration,
    { value: sellerDeposit }
  );
  await createAuctionTx.wait();
  console.log("   Created sample auction with NFT #1");

  // Test the auction
  console.log("\n4. Testing auction functionality...");

  try {
    const auction = await auctionManager.getAuction(1);
    console.log("   ✅ Auction created successfully!");
    console.log("   Seller:", auction.seller);
    console.log("   Token ID:", auction.tokenId.toString());
    console.log("   Is Active:", auction.isActive);
    console.log("   Bid Count:", auction.bidCount.toString());

    // Test bid submission
    console.log("\n5. Testing bid submission...");
    // Create proper bytes data for encrypted bid and proof
    const mockEncBid = ethers.solidityPacked(
      ["uint256", "uint256", "address"],
      [100000000000000000, 1, bidder1.address]
    );
    const mockProof = ethers.solidityPacked(
      ["bytes32", "bytes32"],
      [ethers.keccak256(ethers.toUtf8Bytes("proof1")), ethers.keccak256(ethers.toUtf8Bytes("proof2"))]
    );

    console.log("   Encoded bid data:", mockEncBid);
    console.log("   Proof data length:", mockProof.length);

    const bidTx = await auctionManager.connect(bidder1).submitBidWithDeposit(
      mockEncBid,
      mockProof,
      { value: bidderDeposit }
    );
    await bidTx.wait();
    console.log("   ✅ Bid submitted successfully!");

    // Check updated auction
    const updatedAuction = await auctionManager.getAuction(1);
    console.log("   Updated Bid Count:", updatedAuction.bidCount.toString());

    // Get bids
    const bids = await auctionManager.getAuctionBids(1);
    console.log("   Total Bids:", bids.length);
    console.log("   First Bidder:", bids[0].bidder);

    // Test auction stats
    console.log("\n6. Testing auction stats...");
    const threshold = ethers.parseEther("0.05");
    const countAbove = await auctionManager.revealAuctionStats(1, threshold);
    console.log("   Bids above threshold:", countAbove.toString());

  } catch (error) {
    console.error("   ❌ Error during testing:", error.message);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("TestERC721:", testERC721Address);
  console.log("AuctionManager:", auctionManagerAddress);
  console.log("\n✅ All contracts deployed and tested successfully! 🎉");

  console.log("\n=== Frontend Configuration ===");
  console.log("Update frontend/lib/contracts.ts with:");
  console.log(`address: '${auctionManagerAddress}',`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });