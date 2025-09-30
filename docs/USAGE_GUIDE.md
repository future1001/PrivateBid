# 📖 Usage Guide & Deployment Instructions

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn** package manager
- **MetaMask** or compatible Web3 wallet
- **Git** for cloning the repository

### 1. Project Setup

#### Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd nft

# Install contract dependencies
cd hardhat
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

#### Environment Configuration
```bash
# Copy environment templates
cp hardhat/.env.example hardhat/.env
cp frontend/.env.local.example frontend/.env.local
```

### 2. Local Development Setup

#### Step 1: Start Blockchain Node
```bash
cd hardhat
npm run node
```
This starts a local Hardhat node on port 8545 with pre-funded test accounts.

#### Step 2: Deploy Smart Contracts
```bash
# In a new terminal (keep node running)
cd hardhat
npm run deploy:local
```

Expected output:
```
✅ TestERC721 deployed to: 0x5fbdb2315678afecb367f032d93f642f64180aa3
✅ FHELiquidity deployed to: 0xdc64a140aa3e981100a9beca4e685f962f0cf6c9
✅ AuctionManager deployed to: 0x5fc8d32690cc91d4c39d9d3abcbd16989f875707
```

#### Step 3: Configure MetaMask
1. **Add Local Network**:
   - Network Name: `PrivateBid Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account**:
   ```
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   (This is the first Hardhat test account with 10,000 ETH)

#### Step 4: Start Frontend
```bash
# In a new terminal
cd frontend
npm run dev
```

The application will be available at **http://localhost:3001**

### 3. Using the Application

#### 3.1 Connect Your Wallet
1. Visit `http://localhost:3001`
2. Click **"Connect Wallet"** in the top-right corner
3. Approve the connection in MetaMask
4. Ensure you're connected to the `PrivateBid Local` network

#### 3.2 Create Your First Auction
1. Click **"Create Auction"** in the navigation
2. **Select Asset Type**:
   - **NFT**: For ERC721 tokens
   - **Multiple Items**: For ERC1155 tokens
   - **ENS Domain**: For Ethereum Name Service domains
   - **Contract Role**: For access permissions

3. **Configure Auction Parameters**:
   ```
   Asset Contract: 0x5fbdb2315678afecb367f032d93f642f64180aa3
   Asset ID: 1
   Starting Price: 0.1 ETH
   Reserve Price: 0.5 ETH
   Duration: 24 hours
   ```

4. **Approve and Create**:
   - Approve the NFT transfer
   - Confirm the auction creation transaction
   - Wait for transaction confirmation

#### 3.3 Submit an Encrypted Bid
1. **Browse Auctions**: Click **"Auctions"** to see active listings
2. **Select Auction**: Click on any active auction
3. **Enter Bid Amount**: Type your bid (e.g., 0.15 ETH)
4. **Submit Encrypted Bid**:
   - Click **"Submit Encrypted Bid"**
   - Watch the real-time FHE encryption process
   - Approve the transaction in MetaMask
   - Your bid is now private and encrypted!

#### 3.4 Monitor Your Auctions
1. **Visit Dashboard**: Click **"My Bids"** in navigation
2. **View Status**: Track your created auctions and participated bids
3. **Auction End**: Wait for the auction to conclude
4. **Winner Determination**: The system privately determines the winner

## 🎯 Advanced Features

### FHE Demonstration (`/fhe-demo`)
Explore the FHE technology powering private bidding:

1. **Real-time Encryption**: See live bid encryption
2. **Proof Generation**: Watch zero-knowledge proof creation
3. **Private Comparisons**: Understand encrypted value comparisons
4. **Technical Details**: Learn about the underlying cryptography

### Multiple Asset Support

#### NFTs (ERC721)
```typescript
// Mint test NFT
const tx = await writeContract({
  address: TEST_ERC721_ADDRESS,
  abi: TEST_ERC721_ABI,
  functionName: 'mint',
  args: [userAddress, tokenId]
})
```

#### Multiple Items (ERC1155)
```typescript
// Transfer multiple items
const tx = await writeContract({
  address: ERC1155_ADDRESS,
  abi: ERC1155_ABI,
  functionName: 'safeTransferFrom',
  args: [from, to, tokenId, amount, data]
})
```

#### ENS Domains
```typescript
// Transfer ENS domain
const tx = await writeContract({
  address: ENS_REGISTRY_ADDRESS,
  abi: ENS_REGISTRY_ABI,
  functionName: 'setOwner',
  args: [domainNode, newOwner]
})
```

## 🔧 Configuration Options

### Frontend Configuration (.env.local)
```env
# Network Configuration
NEXT_PUBLIC_NETWORK=localhost

# RPC URLs
NEXT_PUBLIC_HARDHAT_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Contract Addresses
NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
NEXT_PUBLIC_FHE_LIQUIDITY_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_TEST_ERC721_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# API Keys
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Hardhat Configuration (hardhat/.env)
```env
# Deployment Account
PRIVATE_KEY=your_private_key

# API Keys
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key

# FHE Configuration
FHE_VALIDATOR_PRIVATE_KEY=your_fhe_validator_key
```

## 🌐 Network Deployment

### Sepolia Testnet Deployment
```bash
cd hardhat

# Deploy to Sepolia
npm run deploy:sepolia

# Verify contracts
npm run verify:sepolia
```

### Mainnet Deployment
```bash
cd hardhat

# Deploy to Mainnet (CAUTION: Uses real funds)
npm run deploy:mainnet

# Verify contracts
npm run verify:mainnet
```

### Network Configuration Updates

#### Update Frontend for Sepolia
```env
# frontend/.env.local
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

#### Update MetaMask for Sepolia
- Network Name: `Sepolia Testnet`
- RPC URL: `https://sepolia.infura.io/v3/YOUR_KEY`
- Chain ID: `11155111`
- Currency Symbol: `ETH`

## 🔐 Security Best Practices

### Development Security
1. **Never commit private keys** to version control
2. **Use test accounts** for development
3. **Validate all inputs** before processing
4. **Keep dependencies updated** regularly

### Production Security
1. **Audit smart contracts** before mainnet deployment
2. **Use multi-sig wallets** for contract ownership
3. **Implement emergency pause** functionality
4. **Monitor contract activity** continuously

### User Security
1. **Always verify URLs** before connecting wallets
2. **Use hardware wallets** for significant funds
3. **Review transactions** before signing
4. **Keep seed phrases secure and offline**

## 🐛 Troubleshooting

### Common Issues

#### 1. MetaMask Connection Issues
```bash
# Check if network is correctly configured
# Verify RPC URL: http://127.0.0.1:8545
# Verify Chain ID: 31337
```

#### 2. Contract Not Found
```bash
# Ensure contracts are deployed
cd hardhat
npm run deploy:local

# Check contract addresses in frontend/.env.local
```

#### 3. FHE Encryption Errors
```bash
# Clear browser cache and reload
# Check WebAssembly support in browser
# Verify FHE module initialization
```

#### 4. Transaction Failures
```bash
# Check account balance in MetaMask
# Verify gas limit settings
# Ensure network connectivity
```

### Debug Commands

#### Check Contract Status
```bash
cd hardhat
npx hardhat console --network localhost

# In console:
const AuctionManager = await ethers.getContractFactory("AuctionManager")
const auctionManager = await AuctionManager.attach("0x5FC8d32690cc91D4c39d9d3abcBD16989F875707")
console.log(await auctionManager.auctionCount())
```

#### Check Frontend Configuration
```bash
cd frontend
npm run build

# Check for any build errors
# Verify environment variables are loaded
```

## 📊 Monitoring and Analytics

### Development Monitoring
```bash
# Watch contract events
cd hardhat
npm run logs

# Monitor frontend performance
cd frontend
npm run analyze
```

### Production Monitoring
- **Contract Events**: Use blockchain explorers
- **Frontend Analytics**: Google Analytics or Mixpanel
- **Error Tracking**: Sentry or similar service
- **Performance**: Vercel Analytics or Netlify Analytics

## 🚀 Performance Optimization

### Frontend Optimization
```bash
# Build optimized version
cd frontend
npm run build

# Analyze bundle size
npm run analyze

# Test performance
npm run lighthouse
```

### Contract Optimization
- **Gas Optimization**: Review contract gas usage
- **Batch Operations**: Group multiple operations
- **Event Logging**: Efficient event structure
- **Storage Patterns**: Optimize data storage

## 📚 Additional Resources

### Documentation
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [FHE Technical Details](./FHE_INTEGRATION.md)

### External Resources
- [Zama FHEVM Documentation](https://docs.zama.ai/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MetaMask Documentation](https://docs.metamask.io/)

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Real-time chat and support
- **Twitter Updates**: Latest announcements and news

## 🎯 Next Steps

1. **Explore the Demo**: Visit `/fhe-demo` to understand FHE
2. **Create Test Auctions**: Practice with different asset types
3. **Test Encrypted Bidding**: Submit private bids
4. **Review Source Code**: Understand the implementation
5. **Deploy to Testnet**: Try Sepolia network deployment
6. **Contribute**: Submit pull requests and improvements

Enjoy using PrivateBid - the future of private, decentralized auctions! 🎉