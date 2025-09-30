const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Completing deployment final steps...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Contract addresses from previous deployment
  const testERC721Address = "0x4FAC2f8863AAd4d9cfBA8DA6E0e2159627c80793";
  const fheLiquidityAddress = "0xa205ff0827D2934e33997cd70BBC0D63620adfA5";
  const auctionManagerAddress = "0xFd4e3A248800f83bD86AE35F6995fc02B399aD4f";

  // Connect to deployed contracts
  console.log("📋 Connecting to deployed contracts...");
  const testERC721 = await ethers.getContractAt("TestERC721", testERC721Address);
  const fheLiquidity = await ethers.getContractAt("FHELiquidity", fheLiquidityAddress);
  const auctionManager = await ethers.getContractAt("AuctionManager", auctionManagerAddress);

  try {
    // Step 1: Add liquidity to FHE pool
    console.log("\n1. Adding liquidity to FHE pool...");
    const liquidityAmount = ethers.parseEther("1"); // 1 ETH
    const addLiquidityTx = await fheLiquidity.addLiquidity({ value: liquidityAmount });
    await addLiquidityTx.wait();
    console.log("   ✅ Added", ethers.formatEther(liquidityAmount), "ETH to liquidity pool");

    // Step 2: Set up FHE oracle
    console.log("\n2. Setting up FHE oracle...");
    const mockOracleAddress = deployer.address; // Using deployer as mock oracle
    await fheLiquidity.setFHEOracle(mockOracleAddress);
    console.log("   ✅ FHE oracle set to:", mockOracleAddress);

    // Step 3: Create a sample auction
    console.log("\n3. Creating a sample auction...");
    const auctionDuration = 7 * 24 * 60 * 60; // 7 days
    const sellerDeposit = ethers.parseEther("0.5"); // 0.5 ETH
    const bidderDeposit = ethers.parseEther("0.05"); // 0.05 ETH

    // Approve NFT transfer to AuctionManager
    await testERC721.approve(auctionManagerAddress, 1);
    console.log("   ✅ Approved NFT #1 for auction");

    const createAuctionTx = await auctionManager.createAuction(
      testERC721Address,
      1, // tokenId
      0, // AssetType.ERC721
      sellerDeposit,
      bidderDeposit,
      auctionDuration,
      { value: sellerDeposit }
    );
    await createAuctionTx.wait();
    console.log("   ✅ Created sample auction with NFT #1");

    // Get auction details
    const auction = await auctionManager.getAuction(1);
    console.log("\n📊 Sample Auction Details:");
    console.log("   Auction ID:", auction.auctionId.toString());
    console.log("   Asset Contract:", auction.assetContract);
    console.log("   Token ID:", auction.tokenId.toString());
    console.log("   Seller:", auction.seller);
    console.log("   Seller Deposit:", ethers.formatEther(auction.sellerDeposit), "ETH");
    console.log("   Bidder Deposit:", ethers.formatEther(auction.bidderDeposit), "ETH");
    console.log("   End Time:", new Date(Number(auction.endTime) * 1000).toLocaleString());
    console.log("   Status:", auction.isActive ? "Active" : "Inactive");

    // Step 4: Get liquidity pool info
    const liquidityInfo = await fheLiquidity.getLiquidityInfo();
    console.log("\n💰 FHE Liquidity Pool Info:");
    console.log("   Total Liquidity:", ethers.formatEther(liquidityInfo.totalLiquidity), "ETH");
    console.log("   Processing Fee:", liquidityInfo.processingFee.toString(), "basis points");

    console.log("\n🎉 Deployment completed successfully!");

    console.log("\n📝 Contract Addresses Summary:");
    console.log("   TestERC721:", testERC721Address);
    console.log("   FHELiquidity:", fheLiquidityAddress);
    console.log("   AuctionManager:", auctionManagerAddress);

    console.log("\n🔗 Sepolia Etherscan Links:");
    console.log(`   TestERC721: https://sepolia.etherscan.io/address/${testERC721Address}`);
    console.log(`   FHELiquidity: https://sepolia.etherscan.io/address/${fheLiquidityAddress}`);
    console.log(`   AuctionManager: https://sepolia.etherscan.io/address/${auctionManagerAddress}`);

    console.log("\n📋 Next Steps:");
    console.log("   1. Update frontend contract addresses");
    console.log("   2. Test auction functionality");
    console.log("   3. Integrate with real FHE oracle");

  } catch (error) {
    console.error("\n❌ Error during completion:");
    console.error(error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Add more ETH to your wallet");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });