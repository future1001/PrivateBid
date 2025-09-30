#!/bin/bash

# Contract Connection Test Script
# Tests if contracts are deployed and accessible

echo "🔍 Testing Contract Connections..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if hardhat node is running
check_hardhat_node() {
    if curl -s http://127.0.0.1:8545 > /dev/null; then
        print_status "Hardhat node is running ✅"
        return 0
    else
        print_warning "Hardhat node is not running ❌"
        print_status "Start it with: npm run dev:hardhat"
        return 1
    fi
}

# Check if contracts are deployed
check_contracts() {
    cd hardhat

    print_status "Checking contract deployment..."

    # Run a simple script to check contracts
    node -e "
    const { ethers } = require('ethers');

    async function checkContracts() {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        // Known localhost addresses from deployment
        const contracts = {
            'AuctionManager': '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            'FHELiquidity': '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            'TestERC721': '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
        };

        console.log('\\n📊 Contract Status:');
        console.log('====================');

        for (const [name, address] of Object.entries(contracts)) {
            try {
                const code = await provider.getCode(address);
                if (code !== '0x') {
                    console.log(\`✅ \${name}: Deployed at \${address}\`);
                } else {
                    console.log(\`❌ \${name}: Not deployed at \${address}\`);
                }
            } catch (error) {
                console.log(\`❌ \${name}: Error checking - \${error.message}\`);
            }
        }
    }

    checkContracts().catch(console.error);
    "

    cd ..
}

# Check frontend configuration
check_frontend_config() {
    print_status "Checking frontend configuration..."

    if [ -f "frontend/.env.local" ]; then
        print_status "Frontend .env.local found ✅"

        # Check network configuration
        if grep -q "NEXT_PUBLIC_NETWORK=localhost" frontend/.env.local; then
            print_status "Network configured for localhost ✅"
        else
            print_warning "Network not configured for localhost"
        fi

        # Check contract addresses
        if grep -q "NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS" frontend/.env.local; then
            print_status "Contract addresses configured ✅"
        else
            print_warning "Contract addresses not configured"
        fi
    else
        print_warning "Frontend .env.local not found"
        print_status "Copy frontend/.env.example to frontend/.env.local"
    fi
}

# Main test flow
main() {
    echo "🚀 Private Auction House - Contract Connection Test"
    echo "=================================================="
    echo ""

    # Check hardhat node
    if ! check_hardhat_node; then
        echo ""
        print_error "Cannot proceed without Hardhat node running"
        exit 1
    fi

    echo ""

    # Check contracts
    check_contracts

    echo ""

    # Check frontend config
    check_frontend_config

    echo ""
    echo "=================================================="
    echo "✅ Contract connection test completed!"
    echo ""
    echo "Next steps:"
    echo "1. If all checks pass, run: npm run dev"
    echo "2. Open http://localhost:3000"
    echo "3. Connect your wallet to localhost network"
    echo ""
}

# Run the test
main "$@"