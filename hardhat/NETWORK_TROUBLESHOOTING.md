# 网络连接故障排除指南

## 问题：DNS解析失败
错误信息：`Error: getaddrinfo ENOTFOUND rpc-mumbai.maticvigil.com`

### 解决方案

#### 方案1：使用备用RPC端点
在 `.env` 文件中使用不同的RPC URL：

```env
# 使用Polygon官方RPC
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.polygon.technology

# 或者使用Infura
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY

# 或者使用Alchemy
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

#### 方案2：检查网络连接
```bash
# 测试DNS解析
nslookup rpc-mumbai.maticvigil.com

# 测试连接
curl -X POST https://rpc-mumbai.maticvigil.com -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

#### 方案3：使用VPN
有时候网络限制可能导致连接问题，尝试使用VPN。

#### 方案4：本地开发
对于开发和测试，建议使用本地Hardhat网络：

```bash
# 使用内置hardhat网络（推荐用于开发）
npx hardhat run scripts/deploy.js --network hardhat

# 或启动本地节点
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## 当前已部署的合约地址

### Hardhat本地网络
- **AuctionManager**: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
- **TestERC721**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **FHELiquidity**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

这些地址已经在前端配置中更新。

## 推荐的开发流程

1. **本地开发**：使用Hardhat内置网络
2. **测试**：运行完整的测试套件
3. **集成测试**：使用本地节点
4. **部署到测试网**：仅在需要时

## 命令速查

```bash
# 编译合约
npm run compile

# 运行测试
npm run test

# 本地部署（推荐用于开发）
npx hardhat run scripts/deploy.js --network hardhat

# 启动本地节点
npx hardhat node

# 交互测试
npx hardhat run scripts/interact.js --network hardhat
```

## 如果仍然遇到问题

1. 检查防火墙设置
2. 确认网络连接正常
3. 尝试使用不同的网络（切换WiFi/使用手机热点）
4. 联系网络管理员检查是否有DNS限制