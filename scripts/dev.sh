#!/bin/bash

# Private Auction House - Development Server
# This script starts the complete development environment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Private Auction House Dev     ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if environment is set up
check_setup() {
    if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "hardhat" ]; then
        print_error "Project structure not found. Please run 'npm run setup' first."
        exit 1
    fi

    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing now..."
        npm run install:all
    fi
}

# Start development environment
start_dev() {
    print_header
    print_status "Starting development environment..."
    echo ""

    # Start both frontend and hardhat node concurrently
    npm run dev
}

# Start only frontend
start_frontend() {
    print_header
    print_status "Starting frontend development server..."
    echo ""

    npm run dev:frontend
}

# Start only hardhat node
start_hardhat() {
    print_header
    print_status "Starting Hardhat local node..."
    echo ""

    npm run dev:hardhat
}

# Show help
show_help() {
    echo "Private Auction House - Development Environment"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev, start      Start complete development environment (frontend + hardhat)"
    echo "  frontend        Start only frontend development server"
    echo "  hardhat         Start only hardhat local node"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Start complete environment"
    echo "  $0 dev          # Start complete environment"
    echo "  $0 frontend     # Start only frontend"
    echo "  $0 hardhat      # Start only hardhat node"
    echo ""
}

# Main logic
case "${1:-dev}" in
    "dev"|"start")
        check_setup
        start_dev
        ;;
    "frontend")
        check_setup
        start_frontend
        ;;
    "hardhat")
        check_setup
        start_hardhat
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac