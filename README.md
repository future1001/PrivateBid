# 🔐 PrivateBid - FHE-Powered Private Auctions

**A revolutionary auction platform using Fully Homomorphic Encryption (FHE) to enable truly private bidding.**

![FHE Technology](https://img.shields.io/badge/FHE-Powered-purple)
![Privacy First](https://img.shields.io/badge/Privacy-First-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)

## 🎯 What Makes PrivateBid Special?

**PrivateBid uses FHE technology to allow encrypted bids that can be compared without revealing the actual amounts.** This means:

- 🔒 **Complete Bid Privacy**: No one sees bid amounts until auction ends
- 🛡️ **Anti-Manipulation**: Prevents bid sniping and market manipulation
- ⚖️ **Fair Price Discovery**: True market value from genuine competition
- 🔐 **Zero-Knowledge Proofs**: Each bid includes cryptographic proof of validity

## 🔐 FHE Technology Explained

```solidity
// Compare encrypted bids without decryption
ebool comparison = FHE.gt(encryptedBid1, encryptedBid2);
// Smart contracts determine winners while preserving privacy
```

**How it works:**
1. **Client-Side Encryption**: Bids encrypted using TFHE-rs WebAssembly
2. **Zero-Knowledge Proofs**: Each bid includes proof of validity
3. **Private Comparisons**: Smart contracts compare encrypted values
4. **Selective Revelation**: Only winning bids revealed at auction end

## 🚀 Quick Start

```bash
# One-command setup
git clone <repository-url>
cd PrivateBid
npm run setup
npm run dev
```

Access points:
- **Application**: http://localhost:3000
- **FHE Demo**: http://localhost:3000/fhe-demo
- **Blockchain**: http://localhost:8545

## 📁 Project Structure

```
PrivateBid/
├── frontend/          # Next.js 14 + FHE WebAssembly
├── hardhat/           # Smart contracts with FHE operations
├── docs/              # Technical documentation
└── scripts/           # Development utilities
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router + TypeScript
- **Tailwind CSS** - Modern styling
- **Wagmi + Viem** - Web3 integration
- **FHE WebAssembly** - Client-side encryption

### Smart Contracts
- **Solidity ^0.8.24** - Latest features
- **Hardhat** - Development environment
- **FHEVM Integration** - Native FHE support
- **OpenZeppelin** - Security libraries

### Cryptography
- **TFHE-rs** - Homomorphic encryption
- **Zero-Knowledge Proofs** - Bid validation
- **Oracle Network** - Secure decryption

## 🎯 Key Features

### 🔐 **Privacy-First Bidding**
- Encrypted bid amounts using FHE
- Zero-knowledge proof verification
- Private on-chain comparisons
- Selective winner revelation

### 🎨 **Modern Interface**
- Responsive design with Tailwind CSS
- Real-time auction updates
- Live countdown timers
- Interactive FHE demo at `/fhe-demo`

### ⚡ **Developer Experience**
- TypeScript throughout
- Comprehensive testing
- Modular architecture
- Easy deployment

## 📖 Usage

### For Users
1. **Connect wallet** and go to `/auctions`
2. **Enter bid amount** - watch it encrypt in real-time
3. **Submit encrypted bid** with zero-knowledge proof
4. **Privacy guaranteed** - no one sees your bid until auction ends

### For Developers
```typescript
// Encrypt a bid
const { encBid, inputProof } = await encryptBid(amount);

// Submit to smart contract
await writeContract({
  address: AUCTION_MANAGER.address,
  abi: AUCTION_MANAGER.abi,
  functionName: 'submitBidWithDeposit',
  args: [auctionId, encBid, inputProof],
  value: depositAmount,
});
```

## 🧪 Testing & Development

```bash
# Development
npm run dev              # Start full environment
npm run test             # Run contract tests
npm run deploy:local     # Deploy locally

# Frontend
npm run build            # Build for production
npm run lint             # Lint code
```

## 📊 Performance

- **Encryption Speed**: ~100-500ms per bid
- **Data Size**: 1-2KB per encrypted bid
- **Proof Generation**: ~200-800ms
- **Gas Costs**: ~200k gas per encrypted bid

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design overview
- **[FHE Integration](docs/FHE_INTEGRATION_SUMMARY.md)** - Technical details
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Environment setup

## 🚀 Roadmap

- 🎯 **Multi-chain support** (Polygon, Arbitrum)
- 📱 **Native mobile apps**
- 🎭 **Advanced auction types** (Dutch, Vickrey)
- ⚡ **Layer 2 integration**
- 📊 **Advanced analytics**

## 🤝 Contributing

We welcome contributions! Key areas:
- 🔐 FHE performance improvements
- 🎨 UI/UX enhancements
- 📱 Mobile optimization
- 🧪 Test coverage expansion

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ and 🔐 for the future of private auctions**

*PrivateBid - Where Privacy Meets Innovation*