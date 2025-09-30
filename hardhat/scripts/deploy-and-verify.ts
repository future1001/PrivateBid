import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function deployAndVerify() {
  console.log("🚀 Starting deployment with verification...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment");
  }

  // Deploy AuctionManager
  console.log("📜 Deploying AuctionManager...");
  const AuctionManager = await ethers.getContractFactory("AuctionManager");
  const auctionManager = await AuctionManager.deploy();
  await auctionManager.waitForDeployment();

  const auctionManagerAddress = await auctionManager.getAddress();
  console.log("✅ AuctionManager deployed to:", auctionManagerAddress);

  // Deploy TestERC721
  console.log("📜 Deploying TestERC721...");
  const TestERC721 = await ethers.getContractFactory("TestERC721");
  const testERC721 = await TestERC721.deploy("Private Auction NFT", "PA-NFT");
  await testERC721.waitForDeployment();

  const testERC721Address = await testERC721.getAddress();
  console.log("✅ TestERC721 deployed to:", testERC721Address);

  // Deploy FHELiquidity (mock for now)
  console.log("📜 Deploying FHELiquidity...");
  const FHELiquidity = await ethers.getContractFactory("FHELiquidity");
  const fheLiquidity = await FHELiquidity.deploy();
  await fheLiquidity.waitForDeployment();

  const fheLiquidityAddress = await fheLiquidity.getAddress();
  console.log("✅ FHELiquidity deployed to:", fheLiquidityAddress);

  // Wait for a few blocks to ensure contracts are properly deployed
  console.log("⏳ Waiting for block confirmations...");
  await deployer.provider.waitForTransaction(auctionManager.deploymentTransaction()!.hash, 2);
  await deployer.provider.waitForTransaction(testERC721.deploymentTransaction()!.hash, 2);
  await deployer.provider.waitForTransaction(fheLiquidity.deploymentTransaction()!.hash, 2);

  // Verify contracts on Etherscan (if on a testnet)
  const network = await ethers.provider.getNetwork();
  const isTestnet = network.chainId !== 31337n; // Not local hardhat

  if (isTestnet) {
    console.log("🔍 Verifying contracts on Etherscan...");

    try {
      await hre.run("verify:verify", {
        address: auctionManagerAddress,
        constructorArguments: [],
      });
      console.log("✅ AuctionManager verified");
    } catch (error) {
      console.log("❌ AuctionManager verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: testERC721Address,
        constructorArguments: ["Private Auction NFT", "PA-NFT"],
      });
      console.log("✅ TestERC721 verified");
    } catch (error) {
      console.log("❌ TestERC721 verification failed:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: fheLiquidityAddress,
        constructorArguments: [],
      });
      console.log("✅ FHELiquidity verified");
    } catch (error) {
      console.log("❌ FHELiquidity verification failed:", error);
    }
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: Number(network.chainId),
    },
    contracts: {
      AuctionManager: auctionManagerAddress,
      TestERC721: testERC721Address,
      FHELiquidity: fheLiquidityAddress,
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  // Save to deployments file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}-${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Save to .env file for frontend
  const envFile = path.join(__dirname, "../.env");
  const envContent = `
# Network Configuration
NEXT_PUBLIC_NETWORK_ID=${network.chainId}
NEXT_PUBLIC_NETWORK_NAME=${network.name}

# Contract Addresses
NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=${auctionManagerAddress}
NEXT_PUBLIC_TEST_ERC721_ADDRESS=${testERC721Address}
NEXT_PUBLIC_FHE_LIQUIDITY_ADDRESS=${fheLiquidityAddress}

# RPC URL
NEXT_PUBLIC_RPC_URL=${await ethers.provider._getConnection().url}
`;

  fs.writeFileSync(envFile, envContent.trim());

  console.log("📄 Deployment info saved to:", deploymentFile);
  console.log("📄 Environment variables saved to:", envFile);

  // Create some test NFTs
  console.log("🎨 Creating test NFTs...");
  for (let i = 1; i <= 5; i++) {
    const tx = await testERC721.mint(deployer.address);
    await tx.wait();
    console.log(`   Minted NFT #${i}`);
  }

  // Approve NFTs to AuctionManager
  console.log("✅ Approving NFTs to AuctionManager...");
  for (let i = 1; i <= 5; i++) {
    const tx = await testERC721.approve(auctionManagerAddress, i);
    await tx.wait();
    console.log(`   Approved NFT #${i}`);
  }

  console.log("🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   Network: ${network.name} (${network.chainId})`);
  console.log(`   AuctionManager: ${auctionManagerAddress}`);
  console.log(`   TestERC721: ${testERC721Address}`);
  console.log(`   FHELiquidity: ${fheLiquidityAddress}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log("\n🔗 Next steps:");
  console.log("   1. Update frontend environment variables");
  console.log("   2. Start the indexer service");
  console.log("   3. Test contract interactions");

  return {
    auctionManager: auctionManagerAddress,
    testERC721: testERC721Address,
    fheLiquidity: fheLiquidityAddress,
  };
}

// Execute deployment
deployAndVerify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });