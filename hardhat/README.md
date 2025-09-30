# Private Auction House - Smart Contracts

This repository contains the smart contracts for the Private Auction House, a decentralized auction platform with privacy-preserving features using Fully Homomorphic Encryption (FHE).

## Features

- **Privacy-Preserving Bids**: Encrypted bidding using FHE technology
- **Multi-Asset Support**: ERC721, ERC1155, ENS domains, and contract role access
- **Deposit System**: Security deposits for both sellers and bidders
- **Automated Settlement**: Smart contract-driven auction finalization
- **Gas Optimized**: Efficient contract design with minimal gas costs

## Contract Architecture

### Core Contracts

1. **AuctionManager.sol**: Main auction contract handling:
   - Auction creation and management
   - Encrypted bid submission
   - Auction finalization and settlement
   - Asset transfer and deposit management

2. **FHELiquidity.sol**: Liquidity pool for FHE operations:
   - Manages liquidity for bid processing
   - Handles FHE oracle interactions
   - Processing fee management

3. **TestERC721.sol**: Test NFT contract for development and testing

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd hardhat

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## Configuration

Update `.env` with your configuration:

```env
# Polygon Mumbai API Key (for contract verification)
POLYGONSCAN_API_KEY=your_polygon_api_key_here

# Private Key (for testnet deployment)
PRIVATE_KEY=your_private_key_here

# RPC URL (for testnet deployment)
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Gas Reporter
REPORT_GAS=true
```

## Available Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy:local

# Deploy to Polygon Mumbai testnet
npm run deploy:testnet

# Start local Hardhat node
npm run node
```

## Usage

### Local Development

1. Start a local Hardhat node:
```bash
npm run node
```

2. Deploy contracts in a separate terminal:
```bash
npm run deploy:local
```

3. Run interaction script to test functionality:
```bash
npx hardhat run scripts/interact.js --network localhost
```

### Testnet Deployment

1. Configure your `.env` file with testnet credentials

2. Deploy to Polygon Mumbai:
```bash
npm run deploy:testnet
```

3. Verify contracts on Polygonscan (automatic if API key is configured)

## Auction Flow

### Creating an Auction

```solidity
// Create auction with NFT
auctionManager.createAuction(
    nftContractAddress,
    tokenId,
    AssetType.ERC721,
    sellerDeposit,     // e.g., 1 ETH
    bidderDeposit,     // e.g., 0.1 ETH
    auctionDuration,   // e.g., 7 days
    {value: sellerDeposit}
);
```

### Submitting an Encrypted Bid

```solidity
// Submit encrypted bid with deposit
auctionManager.submitBidWithDeposit(
    auctionId,
    encryptedBidAmount,
    zeroKnowledgeProof,
    {value: bidderDeposit}
);
```

### Finalizing an Auction

```solidity
// Finalize after auction ends
auctionManager.finalizeAuction(auctionId);
```

## FHE Integration

The contracts are designed to integrate with Zama's FHE (Fully Homomorphic Encryption) system. Currently, the FHE functionality is implemented as a mock and will be fully integrated when the FHE oracle is available.

### Key FHE Features:

1. **Encrypted Bids**: Bid amounts are encrypted and remain private until auction finalization
2. **Zero-Knowledge Proofs**: Ensure bid validity without revealing amounts
3. **Threshold Comparisons**: Enable auction logic without decrypting individual bids
4. **Secure Winner Selection**: Determine highest bid while maintaining privacy

## Testing

Run the comprehensive test suite:

```bash
npm run test
```

Test coverage includes:
- Auction creation and validation
- Bid submission and verification
- Auction finalization and settlement
- Edge cases and error conditions
- Gas optimization tests

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Secure ownership pattern
- **Deposit System**: Economic incentives for good behavior
- **Time-based Controls**: Auction duration restrictions
- **Input Validation**: Comprehensive parameter checking

## Gas Optimization

The contracts implement several gas optimization strategies:
- Struct packing for storage efficiency
- Minimal external calls
- Efficient event emission
- Optimized bid storage structure

## Audit and Verification

Before mainnet deployment:
1. Complete comprehensive testing
2. Conduct professional security audit
3. Verify contracts on block explorers
4. Test FHE integration thoroughly

## Frontend Integration

Update your frontend contract configuration:

```typescript
// frontend/lib/contracts.ts
export const AUCTION_MANAGER = {
  address: '0x...', // Deployed AuctionManager address
  abi: [/* Contract ABI */]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Review the documentation
- Check the test files for usage examples