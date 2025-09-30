# Sepolia 测试网部署指南

## 🚀 部署前准备

### 1. 获取测试网ETH
前往以下水龙头获取Sepolia测试网ETH：
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [QuickNode Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)

### 2. 获取Infura Project ID
1. 访问 [infura.io](https://infura.io/) 注册账户
2. 创建新项目，选择Web3 API
3. 复制Project ID

### 3. 获取Etherscan API Key
1. 访问 [etherscan.io](https://etherscan.io/) 注册账户
2. 获取API Key (用于合约验证)

## 🔧 配置环境变量

编辑 `.env` 文件，填入你的实际配置：

```env
# 你的私钥（不要包含0x前缀）
PRIVATE_KEY=你的私钥_64位十六进制字符串

# Infura Project ID
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/你的Infura_Project_ID

# Etherscan API Key
ETHERSCAN_API_KEY=你的Etherscan_API_Key

# Gas Reporter
REPORT_GAS=false
```

## 📋 部署步骤

### 1. 确保依赖已安装
```bash
npm install
```

### 2. 编译合约
```bash
npm run compile
```

### 3. 部署到Sepolia测试网
```bash
npm run deploy:sepolia
```

### 4. 验证合约（可选）
部署完成后，合约会自动在Etherscan上验证。

## 📊 部署后操作

### 1. 检查部署结果
部署脚本会输出合约地址，例如：
```
AuctionManager deployed to: 0x1234567890123456789012345678901234567890
FHELiquidity deployed to: 0x0987654321098765432109876543210987654321
TestERC721 deployed to: 0x1111111111111111111111111111111111111111
```

### 2. 在Etherscan上查看
访问以下链接查看部署的合约：
- Sepolia Etherscan: https://sepolia.etherscan.io/

### 3. 更新前端配置
将部署后的合约地址更新到你的前端项目中。

## 🔍 故障排除

### 1. 私钥格式错误
确保私钥是64位的十六进制字符串，不包含0x前缀。

### 2. Insufficient funds
确保钱包有足够的Sepolia测试网ETH支付gas费用。

### 3. RPC连接问题
检查Infura Project ID是否正确，网络连接是否正常。

### 4. 合约验证失败
检查Etherscan API Key是否正确，有时需要等待几分钟才能验证。

## 📝 合约信息

### 主要合约
1. **AuctionManager** - 主要拍卖管理合约
2. **FHELiquidity** - FHE流动性池合约
3. **TestERC721** - 测试NFT合约

### 预估Gas费用
- 编译: ~0.01 ETH
- 部署所有合约: ~0.05-0.1 ETH
- 验证合约: ~0.001 ETH

## 🌐 有用链接

- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Infura Dashboard](https://infura.io/dashboard)
- [Etherscan API Keys](https://etherscan.io/apis)
- [Sepolia Network Info](https://chainlist.org/chain/11155111)

## 📞 支持

如遇问题，请检查：
1. 网络连接
2. 配置文件正确性
3. 钱包余额
4. Infura/Etherscan服务状态