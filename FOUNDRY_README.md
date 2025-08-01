# EventRSVP Smart Contract - Foundry Setup

## 🏗️ Smart Contract Foundation

This project now includes a complete Foundry-based smart contract foundation for the EventRSVP system.

## 📁 Project Structure

```
├── src/
│   └── EventRSVP.sol          # Main smart contract
├── script/
│   └── Deploy.s.sol           # Deployment script
├── test/
│   └── EventRSVP.t.sol        # Contract tests
├── out/                       # Compiled artifacts (generated)
├── foundry.toml              # Foundry configuration
└── constants/contractConfig.js # Frontend integration
```

## 🚀 Quick Start

### Prerequisites
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Node.js for frontend integration

### Commands

```bash
# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Start local Anvil node
anvil

# Deploy locally
forge script script/Deploy.s.sol:DeployEventRSVP --fork-url http://localhost:8545 --broadcast

# Deploy to Sepolia (requires environment variables)
forge script script/Deploy.s.sol:DeployEventRSVP --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 🔧 Environment Variables

Create a `.env` file:

```bash
# RPC URLs
ALCHEMY_API_KEY=your_alchemy_api_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}

# Deployment
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Network Configuration
CHAIN_ID=11155111  # Sepolia
RPC_URL=${SEPOLIA_RPC_URL}
```

## 📋 Contract Features

### Core Functionality
- ✅ **Event Creation**: Organizers can create events with deposits
- ✅ **RSVP System**: Users stake ETH to commit to attendance  
- ✅ **24-Hour Cancellation**: Cancel RSVPs up to 24 hours before event
- ✅ **Attendance Tracking**: Mark attendance and manage refunds
- ✅ **Access Control**: Owner/organizer permissions
- ✅ **Emergency Functions**: Safety mechanisms

### Smart Contract Specifications
- **Solidity Version**: ^0.8.19
- **Min Deposit**: 0.001 ETH
- **Max Deposit**: 1 ETH
- **Cancellation Period**: 24 hours before event
- **Gas Optimized**: ~211k gas for event creation, ~168k for RSVP

## 🧪 Testing

The contract includes comprehensive tests covering:
- Event creation and validation
- RSVP functionality and edge cases
- Cancellation logic and timing
- Attendance marking
- Access control
- Gas usage optimization

```bash
# Run specific test
forge test --match-test testRSVPToEvent

# Run tests with verbosity
forge test -vvv

# Generate coverage report
forge coverage
```

## 🌐 Frontend Integration

The frontend is configured to work with the compiled contract:

- **ABI**: Auto-generated and integrated in `constants/contractConfig.js`
- **Ethers.js**: Primary library for blockchain interaction
- **Networks**: Configured for Sepolia testnet and local development
- **Transaction UI**: Built-in transaction status tracking

## 📦 Deployment Options

### 1. Local Development (Anvil)
```bash
# Terminal 1: Start Anvil
anvil

# Terminal 2: Deploy
forge script script/Deploy.s.sol:DeployEventRSVP --fork-url http://localhost:8545 --broadcast
```

### 2. Sepolia Testnet
```bash
forge script script/Deploy.s.sol:DeployEventRSVP --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### 3. Mainnet (Production)
```bash
forge script script/Deploy.s.sol:DeployEventRSVP --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 🔒 Security Features

- **Access Control**: Owner and organizer permissions
- **Reentrancy Protection**: Safe external calls
- **Input Validation**: Comprehensive parameter checking  
- **Emergency Withdraw**: Owner-only emergency function
- **Deposit Limits**: Min/max deposit constraints
- **Time-based Logic**: Event timing and cancellation windows

## 📈 Gas Reports

Recent gas usage (from tests):
- Deploy: ~2,410,865 gas
- Create Event: ~261,067 gas
- RSVP: ~211,564 gas
- Cancel RSVP: ~75,034 gas
- Mark Attendance: ~77,076 gas

## 🔗 Next Steps

1. **Deploy to Sepolia**: Test on public testnet
2. **Frontend Integration**: Connect React app to deployed contract
3. **Security Audit**: Professional audit before mainnet
4. **UI Polish**: Enhance transaction feedback
5. **Documentation**: User guides and API docs

## 📞 Support

- **Foundry Docs**: https://book.getfoundry.sh/
- **Ethers.js Docs**: https://docs.ethers.org/
- **Sepolia Faucet**: https://sepoliafaucet.com/

The smart contract foundation is ready for deployment and frontend integration! 🎉