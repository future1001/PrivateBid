const fs = require('fs');
const path = require('path');

function extractAbi(contractName, artifactPath) {
  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const abi = artifact.abi;

    // 保存ABI到前端目录
    const frontendPath = path.join(__dirname, '..', 'frontend', 'lib', 'abis');
    if (!fs.existsSync(frontendPath)) {
      fs.mkdirSync(frontendPath, { recursive: true });
    }

    const outputPath = path.join(frontendPath, `${contractName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));

    console.log(`✅ ${contractName} ABI extracted to ${outputPath}`);
    console.log(`   Functions: ${abi.filter(item => item.type === 'function').length}`);
    console.log(`   Events: ${abi.filter(item => item.type === 'event').length}`);
    console.log(`   Errors: ${abi.filter(item => item.type === 'error').length}`);

    return abi;
  } catch (error) {
    console.error(`❌ Error extracting ABI for ${contractName}:`, error.message);
    return null;
  }
}

// 提取所有合约的ABI
console.log('🚀 Extracting contract ABIs...\n');

const contracts = [
  { name: 'AuctionManager', artifact: 'artifacts/contracts/AuctionManager.sol/AuctionManager.json' },
  { name: 'FHELiquidity', artifact: 'artifacts/contracts/FHELiquidity.sol/FHELiquidity.json' },
  { name: 'TestERC721', artifact: 'artifacts/contracts/TestERC721.sol/TestERC721.json' }
];

const hardhatDir = __dirname;

contracts.forEach(({ name, artifact }) => {
  const artifactPath = path.join(hardhatDir, artifact);
  if (fs.existsSync(artifactPath)) {
    extractAbi(name, artifactPath);
  } else {
    console.log(`⚠️  Artifact not found: ${artifactPath}`);
  }
});

console.log('\n✨ ABI extraction completed!');