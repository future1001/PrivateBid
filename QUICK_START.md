# Quick Start Guide

Private Auction House 快速开始指南

## 🚀 快速开始

### 1. 环境准备

确保你已经安装了：
- Node.js >= 18.0.0
- npm >= 9.0.0

### 2. 一键设置

```bash
# 运行自动化设置脚本
npm run setup
```

这个脚本会：
- 安装所有依赖
- 创建环境变量文件
- 设置 Git hooks
- 配置代码格式化

### 3. 配置环境变量

编辑以下文件并填入你的配置：

#### Hardhat 配置 (`hardhat/.env`)
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
```

#### Frontend 配置 (`frontend/.env.local`)
```env
NEXT_PUBLIC_NETWORK=localhost
NEXT_PUBLIC_HARDHAT_RPC_URL=http://127.0.0.1:8545
```

### 4. 部署合约（本地）

```bash
# 编译合约
npm run compile

# 部署到本地网络
npm run deploy:local
```

### 5. 验证连接

```bash
# 测试合约连接和配置
npm run test:connection
```

这个脚本会检查：
- ✅ 合约配置文件
- ✅ 前端 ABI 文件
- ✅ 环境变量配置
- ✅ Hardhat 构件文件

### 6. 启动开发环境

```bash
# 启动完整开发环境（Hardhat + Frontend）
npm run dev
```

这将启动：
- Hardhat 本地区块链 (http://localhost:8545)
- Frontend 开发服务器 (http://localhost:3000)

## 📋 常用命令

```bash
# 开发
npm run dev              # 启动完整环境
npm run dev:frontend     # 仅启动前端
npm run dev:hardhat      # 仅启动 Hardhat 节点

# 合约
npm run compile          # 编译合约
npm run test             # 运行合约测试
npm run deploy:local     # 部署到本地
npm run deploy:sepolia   # 部署到 Sepolia 测试网

# 前端
npm run build            # 构建生产版本
npm run lint             # 代码检查

# 工具
npm run format           # 格式化代码
npm run clean            # 清理构建文件
npm run test:connection  # 测试合约连接
```

## 🎯 测试流程

1. **部署合约**
   ```bash
   npm run compile && npm run deploy:local
   ```

2. **验证连接**
   ```bash
   npm run test:connection
   ```

3. **启动前端**
   ```bash
   npm run dev
   ```

4. **在浏览器中访问** http://localhost:3000

5. **连接钱包**（使用 MetaMask 或其他钱包）
   - 添加本地网络：Chain ID 31337, RPC URL http://localhost:8545
   - 导入测试账户私钥

6. **测试拍卖功能**
   - 创建拍卖
   - 参与竞价
   - 查看拍卖状态

## 🛠️ 故障排除

### 合约连接失败
```bash
# 检查合约是否正确部署
npm run test:connection

# 重新部署合约
npm run clean && npm run compile && npm run deploy:local
```

### 前端无法连接
- 检查 `frontend/.env.local` 配置
- 确保 Hardhat 节点正在运行
- 验证合约地址配置

### 余额不足
```bash
# 启动 Hardhat 节点会自动分配测试账户
npm run dev:hardhat

# 查看测试账户私钥
# 在 Hardhat 启动日志中找到私钥并导入到 MetaMask
```

## 📚 更多文档

- [详细设置指南](docs/SETUP_GUIDE.md)
- [合约部署指南](docs/DEPLOYMENT_STEPS.md)
- [FHE 集成说明](docs/FHE_INTEGRATION_SUMMARY.md)

## 🆘 需要帮助？

1. 检查 [常见问题](docs/TROUBLESHOOTING.md)
2. 查看 [合约测试指南](docs/CONTRACT_TEST_GUIDE.md)
3. 运行诊断脚本：`npm run test:connection`

---

🎉 享受使用 Private Auction House！