# 🚀 快速部署指南

## 当前状态检查
✅ 私钥已配置
✅ Etherscan API Key已配置
⚠️ 需要配置正确的Infura Project ID

## 立即部署步骤

### 1. 完成Infura配置（如果还没完成）
```bash
# 编辑.env文件，将第3行改为：
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/你的真实Infura_Project_ID
```

### 2. 获取测试ETH
如果钱包余额为空，访问：
- https://sepoliafaucet.com/
- 使用你的钱包地址：`0x...`（需要从私钥推导）

### 3. 验证配置
```bash
cd hardhat
npx hardhat run scripts/check_balance.js --network sepolia
```

### 4. 开始部署
```bash
npm run deploy:sepolia
```

### 5. 查看部署结果
成功后你会看到：
```
AuctionManager deployed to: 0x...
FHELiquidity deployed to: 0x...
TestERC721 deployed to: 0x...
```

## 故障排除

### 常见错误：
1. **Invalid JSON-RPC response**: Infura Project ID错误
2. **Insufficient funds**: 需要获取测试ETH
3. **Private key too short**: 私钥格式错误

### 解决方案：
- 检查Infura Project ID是否正确
- 确保钱包有至少0.01 ETH
- 验证私钥是64位十六进制字符串

## 预估费用
- 总Gas费用：约 0.02-0.05 ETH
- 测试网ETH免费获取

## 合约验证
部署完成后会自动在Etherscan上验证合约。

---
💡 提示：部署前先运行检查脚本确认所有配置正确！