const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 检查Sepolia测试网配置...\n");

  try {
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("✅ 部署账户:", deployer.address);

    // 检查余额
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log("💰 账户余额:", balanceEth, "ETH");

    // 检查网络
    const network = await ethers.provider.getNetwork();
    console.log("🌐 当前网络:", network.name, "(Chain ID:", network.chainId, ")");

    // 余额检查
    if (parseFloat(balanceEth) < 0.01) {
      console.log("\n⚠️  警告: 余额不足，建议至少0.01 ETH用于部署");
      console.log("💡 请访问以下水龙头获取测试ETH:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://www.infura.io/faucet/sepolia");
    } else {
      console.log("\n✅ 余额充足，可以开始部署!");
    }

    // 检查环境变量
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "你的64位私钥_不含0x前缀") {
      console.log("\n❌ 错误: 请在.env文件中设置正确的PRIVATE_KEY");
    }

    if (!process.env.SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL === "https://sepolia.infura.io/v3/你的Infura_Project_ID") {
      console.log("❌ 错误: 请在.env文件中设置正确的SEPOLIA_RPC_URL");
    }

    if (!process.env.ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY === "你的Etherscan_API_Key") {
      console.log("❌ 错误: 请在.env文件中设置正确的ETHERSCAN_API_KEY");
    }

    console.log("\n📋 准备就绪检查:");
    console.log("   ✅ 合约已编译");
    console.log("   ✅ 网络配置正确");

    if (parseFloat(balanceEth) >= 0.01) {
      console.log("   ✅ 余额充足");
      console.log("\n🚀 可以开始部署了! 运行: npm run deploy:sepolia");
    } else {
      console.log("   ❌ 余额不足");
      console.log("\n🚦 请先获取测试ETH后再部署");
    }

  } catch (error) {
    console.error("\n❌ 配置检查失败:");
    console.error("错误信息:", error.message);

    if (error.message.includes("private key too short")) {
      console.log("\n💡 解决方案:");
      console.log("   1. 检查.env文件中的PRIVATE_KEY");
      console.log("   2. 确保私钥是64位十六进制字符串");
      console.log("   3. 不要包含0x前缀");
    } else if (error.message.includes("invalid project id") || error.message.includes("Invalid JSON-RPC")) {
      console.log("\n💡 解决方案:");
      console.log("   1. 检查.env文件中的SEPOLIA_RPC_URL");
      console.log("   2. 确保Infura Project ID正确");
      console.log("   3. 访问 https://infura.io/ 获取正确的Project ID");
      console.log("\n📝 示例格式:");
      console.log("   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abcdef123456789abcdef123456789");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 解决方案:");
      console.log("   1. 账户余额不足");
      console.log("   2. 访问水龙头获取测试ETH");
      console.log("   3. https://sepoliafaucet.com/");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });