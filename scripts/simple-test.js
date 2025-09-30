const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Contract Configuration...\n');

// Test 1: Check if contracts-config.json exists
console.log('1. Checking contract configuration...');
if (fs.existsSync('contracts-config.json')) {
    console.log('✅ contracts-config.json found');
    const config = JSON.parse(fs.readFileSync('contracts-config.json', 'utf8'));
    console.log(`   - localhost: ${JSON.stringify(config.localhost, null, 2)}`);
} else {
    console.log('❌ contracts-config.json not found');
}

// Test 2: Check frontend ABIs
console.log('\n2. Checking frontend ABIs...');
const abis = ['AuctionManager.json', 'FHELiquidity.json', 'TestERC721.json'];
abis.forEach(abi => {
    const abiPath = path.join('frontend', 'lib', 'abis', abi);
    if (fs.existsSync(abiPath)) {
        console.log(`✅ ${abi} found`);
    } else {
        console.log(`❌ ${abi} not found`);
    }
});

// Test 3: Check frontend .env.local
console.log('\n3. Checking frontend configuration...');
const envPath = 'frontend/.env.local';
if (fs.existsSync(envPath)) {
    console.log('✅ frontend/.env.local found');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const network = envContent.match(/NEXT_PUBLIC_NETWORK=(.+)/)?.[1] || 'not set';
    console.log(`   - Network: ${network}`);

    if (envContent.includes('NEXT_PUBLIC_AUCTION_MANAGER_ADDRESS')) {
        console.log('✅ Contract addresses configured');
    } else {
        console.log('⚠️  Contract addresses not configured');
    }
} else {
    console.log('❌ frontend/.env.local not found');
    console.log('💡 Copy frontend/.env.example to frontend/.env.local');
}

// Test 4: Check if hardhat artifacts exist
console.log('\n4. Checking Hardhat artifacts...');
const contracts = ['AuctionManager', 'FHELiquidity', 'TestERC721'];
contracts.forEach(contract => {
    const artifactPath = path.join('hardhat', 'artifacts', 'contracts', `${contract}.sol`, `${contract}.json`);
    if (fs.existsSync(artifactPath)) {
        console.log(`✅ ${contract} artifact found`);
    } else {
        console.log(`❌ ${contract} artifact not found - run 'npm run compile'`);
    }
});

console.log('\n🎯 Quick Start Commands:');
console.log('=========================');
console.log('1. Start Hardhat node:  npm run dev:hardhat');
console.log('2. Deploy contracts:    npm run deploy:local');
console.log('3. Start frontend:      npm run dev:frontend');
console.log('4. Or start all:        npm run dev');
console.log('');
console.log('📚 For detailed testing, run: npm run test:connection');