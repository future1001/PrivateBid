# 🚀 Project Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension
- **VS Code** (recommended) with these extensions:
  - Solidity by Juan Blanco
  - TypeScript Importer
  - Tailwind CSS IntelliSense

## 🏗️ Setup Process

### 1. **Clone and Prepare Repository**

```bash
# Clone the repository
git clone <repository-url>
cd nft

# Verify project structure
ls -la
# You should see:
# - hardhat/          # Smart contracts
# - frontend/         # Next.js frontend
# - README.md         # Project documentation
```

### 2. **Backend Setup (Hardhat)**

```bash
# Navigate to hardhat directory
cd hardhat

# Install dependencies
npm install

# Verify installation
npx hardhat --version
```

### 3. **Frontend Setup (Next.js)**

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Verify installation
npm run --version
```

### 4. **Environment Configuration**

#### Hardhat Environment (.env)
Create `.env` file in `hardhat/` directory:

```env
# Private key for deployment (use a test account)
PRIVATE_KEY=your_private_key_here

# Infura API key for network access
INFURA_API_KEY=your_infura_api_key_here

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Network RPC URLs (optional, uses defaults)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

#### Frontend Environment (.env.local)
Create `.env.local` file in `frontend/` directory:

```env
# Contract addresses (update after deployment)
NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_FHE_LIQUIDITY_ADDRESS=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
NEXT_PUBLIC_TEST_ERC721_ADDRESS=0x4FAC2f8863AAd4d9cfBA8DA6E0e2159627c80793

# Infura API key for network configuration
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here

# App configuration
NEXT_PUBLIC_APP_NAME="Private Auction House"
NEXT_PUBLIC_APP_DESCRIPTION="FHE-Powered Private Bidding"
```

## 🔧 Development Workflow

### 1. **Start Local Development**

```bash
# Terminal 1: Start Hardhat local node
cd hardhat
npm run node

# Terminal 2: Deploy contracts to local network
cd hardhat
npm run deploy:local

# Terminal 3: Start frontend development server
cd frontend
npm run dev
```

### 2. **Configure MetaMask**

1. **Add Local Network**
   - Network Name: `Hardhat Local`
   - New RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account**
   - After running `npm run deploy:local`, copy the first account address
   - Use private key from Hardhat output
   - Import account in MetaMask

### 3. **Verify Setup**

1. **Visit Frontend**
   - Open `http://localhost:3000`
   - Check if wallet connection works
   - Verify FHE demo page at `/fhe-demo`

2. **Test Smart Contracts**
   - Try creating an auction
   - Test encrypted bidding functionality
   - Check browser console for logs

## 🧪 Testing

### Contract Tests
```bash
cd hardhat
npm test
```

### Frontend Type Checking
```bash
cd frontend
npx tsc --noEmit
```

### Build Verification
```bash
cd frontend
npm run build
```

## 🚀 Deployment

### Local Deployment (Already Covered Above)

### Testnet Deployment (Sepolia)

```bash
cd hardhat
npm run deploy:sepolia
```

After deployment:
1. **Update Frontend Config**
   ```env
   # In frontend/.env.local
   NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=0xdeployed_contract_address
   NEXT_PUBLIC_FHE_LIQUIDITY_ADDRESS=0xdeployed_fhe_address
   NEXT_PUBLIC_TEST_ERC721_ADDRESS=0xdeployed_erc721_address
   ```

2. **Configure MetaMask for Sepolia**
   - Network Name: `Sepolia Testnet`
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`

3. **Verify Contracts (Optional)**
   ```bash
   npm run verify:sepolia
   ```

### Mainnet Deployment

⚠️ **WARNING**: Only deploy to mainnet after thorough testing

```bash
cd hardhat
npm run deploy:mainnet
```

## 🔧 Common Issues & Solutions

### 1. **Compilation Errors**

**Problem**: Contract compilation fails
```bash
Error: Cannot find module '@fhevm/solidity'
```

**Solution**:
```bash
cd hardhat
npm install @fhevm/solidity @fhevm/hardhat-plugin
npm run compile
```

### 2. **Frontend Build Errors**

**Problem**: TypeScript compilation errors
```
Type error: Property 'startTime' does not exist on type '{}'
```

**Solution**: This is expected in development. The contracts need to be deployed first to provide proper type definitions.

### 3. **MetaMask Connection Issues**

**Problem**: MetaMask cannot connect to wallet
```
Error: No provider was found
```

**Solution**:
1. Ensure MetaMask is installed and unlocked
2. Check that you're on the correct network
3. Refresh the page and try again

### 4. **Contract Interaction Failures**

**Problem**: Transaction fails or reverts
```
Error: Transaction reverted
```

**Solution**:
1. Check if you have enough ETH for gas
2. Verify contract addresses are correct
3. Check browser console for detailed error messages
4. Ensure you're on the correct network

## 🛠️ Development Tips

### 1. **Hot Reload**
- Frontend auto-reloads on file changes
- Contract changes require recompilation and redeployment

### 2. **Debugging**
- Use browser console for frontend debugging
- Use Hardhat console for contract debugging:
  ```bash
  npx hardhat console --network localhost
  ```

### 3. **Gas Optimization**
- Use `gas` reports to optimize contracts:
  ```bash
  npx hardhat test --reporter gas
  ```

### 4. **Contract Verification**
- Verify contracts on Etherscan for transparency:
  ```bash
  npm run verify:sepolia
  ```

## 📁 Useful Commands

### Hardhat Commands
```bash
npm run compile          # Compile contracts
npm run test            # Run tests
npm run node            # Start local node
npm run deploy:local    # Deploy to local
npm run deploy:sepolia  # Deploy to Sepolia
npm run deploy:mainnet  # Deploy to mainnet
npm run verify:sepolia  # Verify contracts
npm run coverage        # Test coverage
```

### Frontend Commands
```bash
npm run dev             # Development server
npm run build           # Production build
npm run start           # Production server
npm run lint            # Lint code
npm run type-check      # Type checking
npm run test            # Run tests
```

## 📚 Next Steps

1. **Explore the Features**
   - Visit `/fhe-demo` to test FHE functionality
   - Create test auctions
   - Submit encrypted bids

2. **Read the Documentation**
   - [README.md](README.md) for project overview
   - [FHE Integration Summary](FHE_INTEGRATION_SUMMARY.md)

3. **Customize and Extend**
   - Modify UI components in `frontend/components/`
   - Add new contract functions
   - Implement additional FHE features

## 🆘 Getting Help

If you encounter issues:

1. **Check console logs** for detailed error messages
2. **Verify environment variables** are correctly set
3. **Ensure all dependencies** are installed
4. **Check network connectivity** and MetaMask configuration

For additional support:
- Create an issue in the repository
- Check the project documentation
- Join community discussions

---

**Happy building! 🎉**