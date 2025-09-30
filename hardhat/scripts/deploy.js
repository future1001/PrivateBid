const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy TestERC721 first (for testing)
  console.log("1. Deploying TestERC721...");
  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const testERC721 = await TestERC721.deploy();
  await testERC721.waitForDeployment();
  const testERC721Address = await testERC721.getAddress();
  console.log("   TestERC721 deployed to:", testERC721Address);

  // Mint some test NFTs
  console.log("   Minting test NFTs...");
  await testERC721.safeMint(deployer.address, "https://example.com/nft/1.json");
  await testERC721.safeMint(deployer.address, "https://example.com/nft/2.json");
  await testERC721.safeMint(deployer.address, "https://example.com/nft/3.json");
  console.log("   Minted 3 test NFTs to deployer");

  // Deploy FHELiquidity
  console.log("\n2. Deploying FHELiquidity...");
  const FHELiquidity = await ethers.getContractFactory("FHELiquidity");
  const fheLiquidity = await FHELiquidity.deploy();
  await fheLiquidity.waitForDeployment();
  const fheLiquidityAddress = await fheLiquidity.getAddress();
  console.log("   FHELiquidity deployed to:", fheLiquidityAddress);

  // Deploy AuctionManager
  console.log("\n3. Deploying AuctionManager...");
  const AuctionManager = await ethers.getContractFactory("AuctionManager");
  const auctionManager = await AuctionManager.deploy();
  await auctionManager.waitForDeployment();
  const auctionManagerAddress = await auctionManager.getAddress();
  console.log("   AuctionManager deployed to:", auctionManagerAddress);

  // Add some liquidity to FHE pool
  console.log("\n4. Adding liquidity to FHE pool...");
  const liquidityAmount = ethers.parseEther("1"); // 1 ETH (reduced from 10 ETH)
  const addLiquidityTx = await fheLiquidity.addLiquidity({ value: liquidityAmount });
  await addLiquidityTx.wait();
  console.log("   Added", ethers.formatEther(liquidityAmount), "ETH to liquidity pool");

  // Set up FHE oracle (mock address for now)
  console.log("\n5. Setting up FHE oracle...");
  const mockOracleAddress = deployer.address; // Using deployer as mock oracle
  await fheLiquidity.setFHEOracle(mockOracleAddress);
  console.log("   FHE oracle set to:", mockOracleAddress);

  // Create a sample auction
  console.log("\n6. Creating a sample auction...");
  const auctionDuration = 7 * 24 * 60 * 60; // 7 days in seconds
  const sellerDeposit = ethers.parseEther("1"); // 1 ETH
  const bidderDeposit = ethers.parseEther("0.1"); // 0.1 ETH

  // Approve NFT transfer to AuctionManager
  await testERC721.approve(auctionManagerAddress, 1);
  console.log("   Approved NFT #1 for auction");

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
  console.log("   Created sample auction with NFT #1");

  // Get auction details
  const auction = await auctionManager.getAuction(1);
  console.log("\n=== Sample Auction Details ===");
  console.log("Auction ID:", auction.auctionId.toString());
  console.log("Asset Contract:", auction.assetContract);
  console.log("Token ID:", auction.tokenId.toString());
  console.log("Seller:", auction.seller);
  console.log("Seller Deposit:", ethers.formatEther(auction.sellerDeposit), "ETH");
  console.log("Bidder Deposit:", ethers.formatEther(auction.bidderDeposit), "ETH");
  console.log("End Time:", new Date(Number(auction.endTime) * 1000).toLocaleString());
  console.log("Status:", auction.isActive ? "Active" : "Inactive");

  console.log("\n=== Deployment Summary ===");
  console.log("TestERC721:", testERC721Address);
  console.log("FHELiquidity:", fheLiquidityAddress);
  console.log("AuctionManager:", auctionManagerAddress);
  console.log("\nAll contracts deployed successfully! 🎉");

  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend contract addresses in:");
  console.log("   frontend/lib/contracts.ts");
  console.log("2. Update the AuctionManager address to:", auctionManagerAddress);
  console.log("3. Test the auction functionality");
  console.log("4. Integrate with actual FHE oracle when ready");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });