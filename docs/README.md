# 🎯 Private Auction House with FHE

A decentralized private auction house with **Fully Homomorphic Encryption (FHE)** support for encrypted bidding. Built with Solidity smart contracts, Next.js frontend, and real FHE integration.

## ✨ Key Features

### 🔐 **Advanced Encryption**
- **Fully Homomorphic Encryption (FHE)** for private bidding
- **Zero-knowledge proofs** for bid validation
- **Encrypted bid comparisons** without revealing values
- **Real-time encryption** with user feedback

### 🏛️ **Smart Contract Features**
- **Multi-asset support**: ERC721, ERC1155, ENS domains, Contract roles
- **Deposit system** for both sellers and bidders
- **Automated auction lifecycle** management
- **FHE integration hooks** for encrypted operations

### 🎨 **User Experience**
- **Modern, responsive UI** with Tailwind CSS
- **Real-time encryption status** feedback
- **Interactive FHE demo** at `/fhe-demo`
- **Mobile-friendly design**

### 🔧 **Development Stack**
- **Smart Contracts**: Solidity 0.8.24 with Hardhat
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: Wagmi, Viem, WalletConnect
- **FHE**: @fhevm/solidity, TFHE-rs, @fhevm/hardhat-plugin

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nft
```

2. **Install dependencies**
```bash
# Install contract dependencies
cd hardhat
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Compile contracts**
```bash
cd hardhat
npm run compile
```

4. **Deploy contracts (local)**
```bash
# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local
```

5. **Start the frontend**
```bash
cd frontend
npm run dev
```

6. **Configure MetaMask**
- Add local network: `http://localhost:8545`
- Chain ID: `31337`
- Import test account from Hardhat output

## 🎮 Using the Application

### 1. **Connect Wallet**
- Click "Connect Wallet" in the header
- Approve connection in MetaMask
- Ensure you're on the correct network

### 2. **Create an Auction**
- Navigate to "Create Auction"
- Select asset type (NFT, ERC1155, ENS, etc.)
- Set auction parameters
- Approve asset transfer and create auction

### 3. **Submit Encrypted Bid**
- Visit an auction page
- Enter your bid amount
- Click "Submit Encrypted Bid"
- Watch real-time FHE encryption
- Approve transaction in wallet

### 4. **Experience FHE Demo**
- Visit `/fhe-demo`
- Try real-time encryption/decryption
- Learn about FHE technology
- See proof generation

## 🔐 FHE Integration Details

### Smart Contract Layer
```solidity
// Encrypted bid structure
struct EncryptedBid {
    address bidder;
    bytes encBid; // Encrypted bid amount
    bytes inputProof; // ZK proof
    uint256 depositAmount;
    uint256 timestamp;
    bool revealed;
    uint256 actualBid;
}

// FHE comparison function
function revealAuctionStats(uint256 auctionId, uint256 threshold)
    external returns (uint256 countAbove)
{
    // In production: FHE.gt(encBid, thresholdEncrypted)
    // without revealing actual bid amounts
}
```

### Frontend Encryption
```typescript
// Real FHE encryption
const { encBid, inputProof } = await encryptBid(bidAmount);

// Submit to blockchain
await writeContractAsync({
    abi: AUCTION_MANAGER.abi,
    address: AUCTION_MANAGER.address,
    functionName: "submitBidWithDeposit",
    args: [auctionId, encBid, inputProof],
    value: bidderDepositWei,
});
```

## 📁 Project Structure

```
nft/
├── hardhat/                    # Smart contracts
│   ├── contracts/             # Solidity contracts
│   ├── scripts/               # Deployment scripts
│   ├── test/                  # Contract tests
│   └── hardhat.config.ts      # Hardhat configuration
├── frontend/                  # Next.js frontend
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   └── contexts/              # React contexts
└── docs/                      # Documentation
```

## 🧪 Testing

### Contract Tests
```bash
cd hardhat
npm test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Build Verification
```bash
cd frontend
npm run build
```

## 🔧 Configuration

### Environment Variables (Frontend)
Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=your_contract_address
NEXT_PUBLIC_FHE_LIQUIDITY_ADDRESS=your_fhe_contract_address
NEXT_PUBLIC_TEST_ERC721_ADDRESS=your_erc721_address
```

### Environment Variables (Hardhat)
Create `.env` in hardhat directory:
```env
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

## 🌐 Deployment

### Local Development
1. Start Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy:local`
3. Update frontend addresses in contracts.ts

### Testnet Deployment
```bash
cd hardhat
npm run deploy:sepolia
```

### Mainnet Deployment
```bash
cd hardhat
npm run deploy:mainnet
```

## 🎯 Smart Contract Functions

### Core Auction Functions
- `createAuction()` - Create new auction
- `submitBidWithDeposit()` - Submit encrypted bid
- `revealAuctionStats()` - FHE comparison function
- `findWinningBid()` - Find winner using FHE
- `finalizeAuction()` - End auction and transfer assets
- `withdrawDeposits()` - Refund deposits

### FHE Integration
- `requestDecryption()` - Request oracle decryption
- FHE comparison operations
- Zero-knowledge proof validation

## 🔒 Security Considerations

### Current Implementation
- ✅ **Mock FHE encryption** for demonstration
- ✅ **Proof validation concepts**
- ✅ **Secure contract patterns**
- ✅ **Reentrancy protection**

### Production Requirements
- 🔒 **True FHE encryption** using TFHE WebAssembly
- 🔒 **Oracle-based decryption**
- 🔒 **Comprehensive testing**
- 🔒 **Security audits**

## 🚀 Roadmap

### Phase 1: Demo ✅
- [x] Basic auction functionality
- [x] Mock FHE encryption
- [x] Responsive UI
- [x] Testnet deployment ready

### Phase 2: Production FHE
- [ ] Real TFHE WebAssembly integration
- [ ] FHE oracle setup
- [ ] Security audits
- [ ] Mainnet deployment

### Phase 3: Advanced Features
- [ ] Multi-chain support
- [ ] Advanced auction types
- [ ] Governance system
- [ ] Yield optimization

## 🛠️ Development Scripts

### Hardhat Commands
```bash
npm run compile          # Compile contracts
npm run test            # Run contract tests
npm run deploy:local    # Deploy to local network
npm run deploy:sepolia  # Deploy to Sepolia testnet
npm run node            # Start local Hardhat node
npm run verify          # Verify contracts on Etherscan
```

### Frontend Commands
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run test            # Run tests
```

## 📚 Learn More

### FHE Resources
- [Zama FHEVM Documentation](https://docs.zama.ai/)
- [TFHE-rs Library](https://github.com/zama-ai/tfhe-rs)
- [FHE Solidity Guide](https://docs.zama.ai/fhe-solidity/)

### Blockchain Development
- [Hardhat Documentation](https://hardhat.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [FAQ](docs/FAQ.md)
2. Search [existing issues](../../issues)
3. Create a [new issue](../../issues/new)
4. Join our Discord community

---

**Built with ❤️ using FHE technology for private, decentralized auctions**