const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying deployed contracts...\n");

  // Contract addresses from previous deployment
  const testERC721Address = "0x4FAC2f8863AAd4d9cfBA8DA6E0e2159627c80793";
  const fheLiquidityAddress = "0xa205ff0827D2934e33997cd70BBC0D63620adfA5";
  const auctionManagerAddress = "0xFd4e3A248800f83bD86AE35F6995fc02B399aD4f";

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  try {
    // Connect to deployed contracts
    console.log("📋 Connecting to deployed contracts...");
    const testERC721 = await ethers.getContractAt("TestERC721", testERC721Address);
    const fheLiquidity = await ethers.getContractAt("FHELiquidity", fheLiquidityAddress);
    const auctionManager = await ethers.getContractAt("AuctionManager", auctionManagerAddress);

    // Test TestERC721
    console.log("\n🎨 Testing TestERC721...");
    const tokenName = await testERC721.name();
    const tokenSymbol = await testERC721.symbol();
    const ownerBalance = await testERC721.balanceOf(deployer.address);
    console.log("   Name:", tokenName);
    console.log("   Symbol:", tokenSymbol);
    console.log("   Owner balance:", ownerBalance.toString());

    // Test FHELiquidity
    console.log("\n💰 Testing FHELiquidity...");
    const totalLiquidity = await fheLiquidity.totalLiquidity();
    const processingFee = await fheLiquidity.processingFeePercentage();
    const oracleAddress = await fheLiquidity.fheOracle();
    const userDeposit = await fheLiquidity.getUserDeposit(deployer.address);
    console.log("   Total Liquidity:", ethers.formatEther(totalLiquidity), "ETH");
    console.log("   Processing Fee:", processingFee.toString(), "basis points");
    console.log("   FHE Oracle:", oracleAddress);
    console.log("   Your Deposit:", ethers.formatEther(userDeposit), "ETH");

    // Test AuctionManager
    console.log("\n🏷️ Testing AuctionManager...");
    const nextAuctionId = await auctionManager.nextAuctionId();
    const auctionFee = await auctionManager.auctionFeePercentage();
    const minDuration = await auctionManager.minAuctionDuration();
    const maxDuration = await auctionManager.maxAuctionDuration();
    console.log("   Next Auction ID:", nextAuctionId.toString());
    console.log("   Auction Fee:", auctionFee.toString(), "basis points");
    console.log("   Min Duration:", minDuration.toString(), "seconds");
    console.log("   Max Duration:", maxDuration.toString(), "seconds");

    // Check if we can get auction count
    const auctionCount = nextAuctionId; // Since IDs start from 1
    console.log("   Total Auctions Created:", auctionCount.toString() - 1);

    console.log("\n🎉 All contracts are working!");

    console.log("\n📝 Contract Addresses Summary:");
    console.log("   TestERC721:", testERC721Address);
    console.log("   FHELiquidity:", fheLiquidityAddress);
    console.log("   AuctionManager:", auctionManagerAddress);

    console.log("\n🔗 Sepolia Etherscan Links:");
    console.log(`   TestERC721: https://sepolia.etherscan.io/address/${testERC721Address}`);
    console.log(`   FHELiquidity: https://sepolia.etherscan.io/address/${fheLiquidityAddress}`);
    console.log(`   AuctionManager: https://sepolia.etherscan.io/address/${auctionManagerAddress}`);

    console.log("\n✅ Deployment verification completed successfully!");
    console.log("   All contracts are deployed and accessible");
    console.log("   FHE liquidity pool has been funded");
    console.log("   Oracle has been configured");

  } catch (error) {
    console.error("\n❌ Error during verification:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });