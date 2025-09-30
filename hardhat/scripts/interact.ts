import { ethers } from "hardhat";

async function interact() {
  console.log("🔧 Contract Interaction Script");

  // Get signers
  const [deployer, bidder1, bidder2] = await ethers.getSigners();
  console.log("📝 Available accounts:");
  console.log("   Deployer:", deployer.address);
  console.log("   Bidder 1:", bidder1.address);
  console.log("   Bidder 2:", bidder2.address);

  // Contract addresses (update these with your deployed addresses)
  const AUCTION_MANAGER_ADDRESS = process.env.AUCTION_MANAGER_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TEST_ERC721_ADDRESS = process.env.TEST_ERC721_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get contract instances
  const auctionManager = await ethers.getContractAt("AuctionManager", AUCTION_MANAGER_ADDRESS);
  const testERC721 = await ethers.getContractAt("TestERC721", TEST_ERC721_ADDRESS);

  console.log("\n📊 Contract Status:");
  try {
    const nextAuctionId = await auctionManager.nextAuctionId();
    console.log("   Next auction ID:", nextAuctionId.toString());
  } catch (error) {
    console.log("   Could not fetch next auction ID");
  }

  // Interaction options
  console.log("\n🎯 Available interactions:");
  console.log("1. Create auction");
  console.log("2. Submit bid");
  console.log("3. Finalize auction");
  console.log("4. Get auction details");
  console.log("5. Get user auctions");

  const { action } = await prompt("Select action (1-5): ");

  switch (action) {
    case "1":
      await createAuction(auctionManager, testERC721, deployer);
      break;
    case "2":
      await submitBid(auctionManager, bidder1);
      break;
    case "3":
      await finalizeAuction(auctionManager, deployer);
      break;
    case "4":
      await getAuctionDetails(auctionManager);
      break;
    case "5":
      await getUserAuctions(auctionManager, deployer);
      break;
    default:
      console.log("❌ Invalid action selected");
  }
}

async function createAuction(auctionManager: any, testERC721: any, seller: any) {
  console.log("\n🎨 Creating auction...");

  const tokenId = await prompt("Enter token ID (1-5): ");
  const sellerDeposit = ethers.parseEther(await prompt("Enter seller deposit (ETH): ") || "0.5");
  const bidderDeposit = ethers.parseEther(await prompt("Enter bidder deposit (ETH): ") || "0.05");
  const duration = 86400; // 24 hours

  // Check if seller owns the token
  const owner = await testERC721.ownerOf(tokenId);
  if (owner.toLowerCase() !== seller.address.toLowerCase()) {
    console.log("❌ You don't own this token");
    return;
  }

  // Approve token transfer
  console.log("📝 Approving token transfer...");
  const approveTx = await testERC721.approve(await auctionManager.getAddress(), tokenId);
  await approveTx.wait();
  console.log("✅ Token approved");

  // Create auction
  console.log("🎨 Creating auction...");
  const createTx = await auctionManager.createAuction(
    await testERC721.getAddress(),
    tokenId,
    0, // ERC721
    sellerDeposit,
    bidderDeposit,
    duration,
    { value: sellerDeposit }
  );
  await createTx.wait();

  const auctionId = await auctionManager.nextAuctionId();
  console.log(`✅ Auction #${auctionId - 1n} created successfully!`);
}

async function submitBid(auctionManager: any, bidder: any) {
  console.log("\n💰 Submitting bid...");

  const auctionId = await prompt("Enter auction ID: ");
  const depositAmount = ethers.parseEther(await prompt("Enter bid amount (ETH): ") || "1.0");

  // Get auction details
  const auction = await auctionManager.getAuction(auctionId);
  console.log(`   Auction requires deposit: ${ethers.formatEther(auction.bidderDeposit)} ETH`);

  if (depositAmount < auction.bidderDeposit) {
    console.log("❌ Insufficient bid amount");
    return;
  }

  // Submit bid (mock encrypted bid for testing)
  const mockEncryptedBid = ethers.toUtf8Bytes("encrypted_bid_" + Math.random());
  const mockProof = ethers.toUtf8Bytes("proof_" + Math.random());

  const bidTx = await auctionManager.submitBidWithDeposit(
    auctionId,
    mockEncryptedBid,
    mockProof,
    { value: depositAmount }
  );
  await bidTx.wait();

  console.log("✅ Bid submitted successfully!");
}

async function finalizeAuction(auctionManager: any, caller: any) {
  console.log("\n🏁 Finalizing auction...");

  const auctionId = await prompt("Enter auction ID: ");

  // Check if auction can be finalized
  const auction = await auctionManager.getAuction(auctionId);
  const currentTime = await ethers.provider.getBlock("latest").then(block => block.timestamp);

  if (currentTime < auction.endTime) {
    console.log("❌ Auction is still active");
    return;
  }

  if (auction.finalized) {
    console.log("❌ Auction already finalized");
    return;
  }

  // Finalize auction
  console.log("🏁 Finalizing auction...");
  const finalizeTx = await auctionManager.finalizeAuction(auctionId);
  await finalizeTx.wait();

  console.log("✅ Auction finalized successfully!");

  // Get final auction details
  const finalAuction = await auctionManager.getAuction(auctionId);
  console.log(`   Winner: ${finalAuction.winner}`);
  console.log(`   Winning bid: ${ethers.formatEther(finalAuction.winningBid)} ETH`);
}

async function getAuctionDetails(auctionManager: any) {
  console.log("\n📋 Getting auction details...");

  const auctionId = await prompt("Enter auction ID: ");

  try {
    const auction = await auctionManager.getAuction(auctionId);
    const bids = await auctionManager.getAuctionBids(auctionId);

    console.log("📋 Auction Details:");
    console.log(`   ID: ${auction.auctionId}`);
    console.log(`   Seller: ${auction.seller}`);
    console.log(`   Asset Contract: ${auction.assetContract}`);
    console.log(`   Token ID: ${auction.tokenId}`);
    console.log(`   Asset Type: ${auction.assetType}`);
    console.log(`   Seller Deposit: ${ethers.formatEther(auction.sellerDeposit)} ETH`);
    console.log(`   Bidder Deposit: ${ethers.formatEther(auction.bidderDeposit)} ETH`);
    console.log(`   Start Time: ${new Date(Number(auction.startTime) * 1000).toLocaleString()}`);
    console.log(`   End Time: ${new Date(Number(auction.endTime) * 1000).toLocaleString()}`);
    console.log(`   Finalized: ${auction.finalized}`);
    console.log(`   Active: ${auction.isActive}`);
    console.log(`   Bid Count: ${auction.bidCount}`);
    console.log(`   Winner: ${auction.winner || "Not determined"}`);
    console.log(`   Winning Bid: ${auction.winningBid ? ethers.formatEther(auction.winningBid) + " ETH" : "Not determined"}`);
    console.log(`   Total Bids: ${bids.length}`);
  } catch (error) {
    console.log("❌ Could not fetch auction details");
  }
}

async function getUserAuctions(auctionManager: any, user: any) {
  console.log("\n👤 Getting user auctions...");

  try {
    const auctions = await auctionManager.getUserAuctions(user.address);
    console.log(`📋 User has ${auctions.length} auctions:`);

    for (let i = 0; i < auctions.length; i++) {
      const auction = await auctionManager.getAuction(auctions[i]);
      console.log(`   ${i + 1}. Auction #${auction.auctionId} - ${auction.finalized ? "Finalized" : auction.isActive ? "Active" : "Inactive"}`);
    }
  } catch (error) {
    console.log("❌ Could not fetch user auctions");
  }
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Execute interaction
interact()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction failed:", error);
    process.exit(1);
  });