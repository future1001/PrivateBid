#!/bin/bash

# Private Auction House - Development Environment Setup
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Private Auction House development environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js >= 18.0.0"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d 'v' -f 2)
    REQUIRED_VERSION="18.0.0"

    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js >= $REQUIRED_VERSION"
        exit 1
    fi

    print_status "Node.js version $NODE_VERSION ✓"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi

    NPM_VERSION=$(npm -v)
    print_status "npm version $NPM_VERSION ✓"
}

# Install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm install

    print_status "Installing Hardhat dependencies..."
    cd hardhat && npm install && cd ..

    print_status "Installing Frontend dependencies..."
    cd frontend && npm install && cd ..
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."

    if [ ! -f hardhat/.env ]; then
        cp hardhat/.env.example hardhat/.env
        print_warning "Created hardhat/.env from example. Please update with your private keys and RPC URLs."
    fi

    if [ ! -f frontend/.env.local ]; then
        cp frontend/.env.example frontend/.env.local
        print_warning "Created frontend/.env.local from example. Please update with your environment variables."
    fi
}

# Create Prettier configuration
create_prettier_config() {
    if [ ! -f .prettierrc ]; then
        print_status "Creating Prettier configuration..."
        cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF
    fi
}

# Create Husky pre-commit hook
setup_git_hooks() {
    if [ ! -d .git/hooks ]; then
        print_status "Setting up Git hooks..."
        npx husky install

        # Create pre-commit hook
        cat > .husky/pre-commit << EOF
#!/usr/bin/env sh
. "\$(dirname -- "\$0")/_/husky.sh"

npx lint-staged
EOF

        chmod +x .husky/pre-commit

        # Add lint-staged configuration to package.json
        npm pkg set lint-staged="{\"**/*.{js,jsx,ts,tsx,json,md}\": \"prettier --write\"}"
    fi
}

# Main setup process
main() {
    print_status "Starting development environment setup..."

    check_node
    check_npm
    install_dependencies
    setup_env
    create_prettier_config
    setup_git_hooks

    echo ""
    print_status "✅ Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update hardhat/.env with your private keys and RPC URLs"
    echo "2. Update frontend/.env.local with your environment variables"
    echo "3. Run 'npm run dev' to start the development environment"
    echo "4. Run 'npm run compile' to compile smart contracts"
    echo "5. Run 'npm run deploy:local' to deploy contracts locally"
    echo ""
    echo "Useful commands:"
    echo "- npm run dev              # Start both frontend and hardhat node"
    echo "- npm run dev:frontend     # Start only frontend"
    echo "- npm run dev:hardhat      # Start only hardhat node"
    echo "- npm run compile          # Compile smart contracts"
    echo "- npm run test             # Run contract tests"
    echo "- npm run build            # Build frontend for production"
    echo "- npm run format           # Format all files with Prettier"
    echo ""
}

# Run main function
main "$@"