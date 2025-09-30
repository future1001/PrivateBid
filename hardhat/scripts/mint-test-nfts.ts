import { ethers } from "hardhat";

async function mintTestNFTs() {
  console.log("🎨 Minting Test NFTs for Testing");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Get TestERC721 contract address
  const TEST_ERC721_ADDRESS = process.env.TEST_ERC721_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const testERC721 = await ethers.getContractAt("TestERC721", TEST_ERC721_ADDRESS);

  console.log("📜 TestERC721 contract:", TEST_ERC721_ADDRESS);

  // Mint multiple NFTs with different metadata
  const nfts = [
    { id: 1, name: "Genesis Art", description: "The first piece in our collection" },
    { id: 2, name: "Digital Sunset", description: "A beautiful digital sunset" },
    { id: 3, name: "Abstract Mind", description: "An exploration of abstract consciousness" },
    { id: 4, name: "Cyber Dreams", description: "Visions of the digital future" },
    { id: 5, name: "Pixel Paradise", description: "Retro gaming nostalgia meets modern art" },
    { id: 6, name: "Neon Nights", description: "Electric dreams in neon colors" },
    { id: 7, name: "Code Poetry", description: "Where programming becomes art" },
    { id: 8, name: "Blockchain Beauty", description: "The aesthetic of decentralization" },
    { id: 9, name: "Virtual Visions", description: "Imaginary worlds made real" },
    { id: 10, name: "Ethereal Essence", description: "Capturing the spirit of the blockchain" }
  ];

  console.log(`🎨 Minting ${nfts.length} NFTs...`);

  for (const nft of nfts) {
    try {
      // Check if already minted
      const owner = await testERC721.ownerOf(nft.id);
      console.log(`⚠️  NFT #${nft.id} already minted to ${owner}`);
      continue;
    } catch {
      // NFT doesn't exist, mint it
      try {
        const tx = await testERC721.mint(deployer.address);
        const receipt = await tx.wait();
        console.log(`✅ Minted NFT #${nft.id} - ${nft.name}`);
        console.log(`   Transaction: ${receipt.hash}`);
        console.log(`   Gas used: ${receipt.gasUsed}`);
      } catch (error) {
        console.log(`❌ Failed to mint NFT #${nft.id}:`, error);
      }
    }
  }

  // Get total supply
  const totalSupply = await testERC721.totalSupply();
  console.log(`\n📊 Total NFTs minted: ${totalSupply}`);

  // Get owner's NFTs
  const balance = await testERC721.balanceOf(deployer.address);
  console.log(`👤 Owner's NFT balance: ${balance}`);

  // List first 5 NFTs owned
  console.log("📋 First 5 owned NFTs:");
  for (let i = 0; i < Math.min(5, Number(balance)); i++) {
    try {
      const tokenId = await testERC721.tokenOfOwnerByIndex(deployer.address, i);
      console.log(`   ${i + 1}. NFT #${tokenId}`);
    } catch (error) {
      console.log(`   ${i + 1}. Error fetching token: ${error}`);
    }
  }

  console.log("\n🎉 NFT minting complete!");
  console.log("💡 Next steps:");
  console.log("   1. Use these NFTs to test auction functionality");
  console.log("   2. Approve NFTs to AuctionManager contract");
  console.log("   3. Create test auctions");
}

// Execute minting
mintTestNFTs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Minting failed:", error);
    process.exit(1);
  });