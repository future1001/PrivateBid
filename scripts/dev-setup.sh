#!/bin/bash

# Private Auction House Development Environment Setup Script
echo "🚀 Private Auction House Development Environment Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the root directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "hardhat" ] || [ ! -d "indexer" ]; then
    echo -e "${RED}❌ Please run this script from the root directory${NC}"
    echo "Expected directory structure:"
    echo "├── package.json"
    echo "├── frontend/"
    echo "├── hardhat/"
    echo "└── indexer/"
    exit 1
fi

echo -e "${BLUE}📁 Project structure verified${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_NODE="20"
    if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
        echo -e "${GREEN}✅ Node.js $NODE_VERSION (>=20)${NC}"
    else
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old (requires >=20)${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed${NC}"
    echo -e "${YELLOW}   Install PostgreSQL or use Docker${NC}"
fi

# Check Docker
if command_exists docker; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
else
    echo -e "${YELLOW}⚠️  Docker is not installed${NC}"
    echo -e "${YELLOW}   Install Docker for easier setup${NC}"
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install root dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Installing root dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}   Root dependencies already installed${NC}"
fi

# Setup Hardhat
echo -e "${BLUE}🔧 Setting up Hardhat contracts...${NC}"
cd hardhat

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Installing Hardhat dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}   Hardhat dependencies already installed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}   Creating Hardhat .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}   ⚠️  Please edit hardhat/.env and add your PRIVATE_KEY${NC}"
fi

# Compile contracts
echo -e "${BLUE}   Compiling contracts...${NC}"
npm run compile

cd ..

# Setup Indexer
echo -e "${BLUE}🔍 Setting up Indexer...${NC}"
cd indexer

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Installing Indexer dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}   Indexer dependencies already installed${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}   Creating Indexer .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}   ⚠️  Please edit indexer/.env and configure database settings${NC}"
fi

# Generate Prisma client
echo -e "${BLUE}   Generating Prisma client...${NC}"
npm run db:generate

cd ..

# Setup Frontend
echo -e "${BLUE}🎨 Setting up Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Installing Frontend dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}   Frontend dependencies already installed${NC}"
fi

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${BLUE}   Creating Frontend .env.local file...${NC}"
    cat > .env.local << EOF
# WalletConnect (示例值，需要替换为真实值)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo_project_id

# Infura API Key (示例值，需要替换为真实值)
NEXT_PUBLIC_INFURA_API_KEY=demo_infura_key

# 合约地址 (Sepolia测试网已部署地址)
NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=0xFd4e3A248800f83bD86AE35F6995fc02B399aD4f
NEXT_PUBLIC_FHE_LIQUIDITY_ADDRESS=0xa205ff0827D2934e33997cd70BBC0D63620adfA5
NEXT_PUBLIC_TEST_ERC721_ADDRESS=0x4FAC2f8863AAd4d9cfBA8DA6E0e2159627c80793

# 网络配置
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia

# Indexer API 配置
NEXT_PUBLIC_INDEXER_URL=http://localhost:3001
EOF
    echo -e "${GREEN}   Frontend .env.local created${NC}"
fi

cd ..

# Create development scripts directory
echo -e "${BLUE}📝 Creating development scripts...${NC}"
mkdir -p scripts

# Create start script
cat > scripts/start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Private Auction House Development Environment"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping all services..."
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    exit 0
}

# Set up cleanup on exit
trap cleanup EXIT INT TERM

# Start Hardhat local node (in background)
echo "🔗 Starting Hardhat local node..."
cd hardhat
npm run node &
HARDHAT_PID=$!
cd ..

# Start Indexer (in background)
echo "🔍 Starting Indexer..."
cd indexer
npm run dev &
INDEXER_PID=$!
cd ..

# Wait a moment for services to start
sleep 5

# Check if services are running
echo "🔍 Checking service status..."

# Check Hardhat node
if curl -s http://localhost:8545 >/dev/null; then
    echo -e "${GREEN}✅ Hardhat node is running${NC}"
else
    echo -e "${RED}❌ Hardhat node failed to start${NC}"
fi

# Check Indexer
if curl -s http://localhost:3001/health >/dev/null; then
    echo -e "${GREEN}✅ Indexer is running${NC}"
else
    echo -e "${YELLOW}⚠️  Indexer is starting up...${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo ""
echo "📋 Services:"
echo "   Hardhat Node: http://localhost:8545"
echo "   Indexer API: http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev           # Start frontend"
echo "   npm run hardhat:deploy # Deploy contracts"
echo "   npm run indexer:start # Start indexer"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Keep script running
wait
EOF

chmod +x scripts/start-dev.sh

# Create deploy script
cat > scripts/deploy-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploy All Components to Sepolia Testnet"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ PRIVATE_KEY environment variable is not set${NC}"
    echo -e "${YELLOW}   Add it to hardhat/.env${NC}"
    exit 1
fi

# Deploy contracts
echo "🔗 Deploying contracts to Sepolia..."
cd hardhat
npm run deploy:sepolia

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contracts deployed successfully${NC}"
else
    echo -e "${RED}❌ Contract deployment failed${NC}"
    exit 1
fi

cd ..

# Extract contract addresses
echo "📋 Extracting contract addresses..."
CONTRACT_MANAGER=$(grep "AuctionManager deployed to:" hardhat/console-output.txt | tail -1 | cut -d' ' -f3)
TEST_ERC721=$(grep "TestERC721 deployed to:" hardhat/console-output.txt | tail -1 | cut -d' ' -f3)

# Update frontend environment
echo "🎨 Updating frontend configuration..."
cd frontend
sed -i "s/NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=.*/NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS=$CONTRACT_MANAGER/" .env.local
sed -i "s/NEXT_PUBLIC_TEST_ERC721_ADDRESS=.*/NEXT_PUBLIC_TEST_ERC721_ADDRESS=$TEST_ERC721/" .env.local
cd ..

# Update indexer environment
echo "🔍 Updating indexer configuration..."
cd indexer
sed -i "s/AUCTION_MANAGER_ADDRESS=.*/AUCTION_MANAGER_ADDRESS=$CONTRACT_MANAGER/" .env
sed -i "s/TEST_ERC721_ADDRESS=.*/TEST_ERC721_ADDRESS=$TEST_ERC721/" .env
cd ..

echo -e "${GREEN}✅ All components deployed and configured!${NC}"
echo ""
echo "📋 Contract Addresses:"
echo "   AuctionManager: $CONTRACT_MANAGER"
echo "   TestERC721: $TEST_ERC721"
echo ""
echo "🔗 Explorer URLs:"
echo "   https://sepolia.etherscan.io/address/$CONTRACT_MANAGER"
echo "   https://sepolia.etherscan.io/address/$TEST_ERC721"
EOF

chmod +x scripts/deploy-all.sh

# Create test script
cat > scripts/run-tests.sh << 'EOF'
#!/bin/bash

echo "🧪 Running All Tests"

echo -e "${BLUE}📜 Running Hardhat tests...${NC}"
cd hardhat
npm test
HARDHAT_RESULT=$?
cd ..

echo -e "${BLUE}🔍 Running Indexer tests...${NC}"
cd indexer
npm test
INDEXER_RESULT=$?
cd ..

echo -e "${BLUE}🎨 Running Frontend tests...${NC}"
cd frontend
npm test
FRONTEND_RESULT=$?
cd ..

# Summary
echo ""
echo "📊 Test Results Summary:"
echo "   Hardhat: $([ $HARDHAT_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "   Indexer: $([ $INDEXER_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo "   Frontend: $([ $FRONTEND_RESULT -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")"

OVERALL_RESULT=$((HARDHAT_RESULT + INDEXER_RESULT + FRONTEND_RESULT))

if [ $OVERALL_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
EOF

chmod +x scripts/run-tests.sh

echo ""
echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Available commands:${NC}"
echo "   ./scripts/start-dev.sh      # Start all development services"
echo "   ./scripts/deploy-all.sh      # Deploy all to Sepolia"
echo "   ./scripts/run-tests.sh      # Run all tests"
echo ""
echo -e "${BLUE}🔧 Manual commands:${NC}"
echo "   cd frontend && npm run dev      # Start frontend only"
echo "   cd hardhat && npm run node      # Start local node"
echo "   cd indexer && npm run dev       # Start indexer"
echo "   cd hardhat && npm run test      # Run contract tests"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "   1. Configure your environment variables in .env files"
echo "   2. Run './scripts/start-dev.sh' to start all services"
echo "   3. Visit http://localhost:3000 to view the frontend"
echo "   4. Use the deployment scripts to deploy to testnet"