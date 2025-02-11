# Sui On-Chain Randomness 🎲

A decentralized random winner selector built on Sui Network that leverages on-chain randomness for transparent and verifiable selection processes.

![Sui Network](https://img.shields.io/badge/Sui-Network-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Demo

Try it out: [Live Demo](https://suirandom.vercel.app/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone git@github.com:karangoraniya/sui-randomness.git
cd sui-randomness

# Install dependencies and start the project
make all # Deploy everything (build, publish)
```

## 📋 Available Commands

```bash
make all       # Deploy everything (build, publish)
make deploy    # Same as above
make build     # Only build the contract
make publish   # Only publish the contract
make balance   # Check wallet balance
```

## 🏗️ Project Structure

```
sui-randomness/
├── frontend/         # Frontend application
│   └── suirandom-fe/   # Frontend Next Js application
├── contracts/       # Smart contracts
│   └── sources/ # Main contract directory
└── README.md        # This file
```

## 🔧 Technical Details

- Frontend: Next.js
- Smart Contracts: Sui Move
- Deployment: Sui Network

## 📜 Smart Contract Details

For detailed information about the smart contracts, please see the [Contract README](./contract/README.md).

## 🎮 Usage

### Input Methods

- Enter Sui wallet addresses (one per line or comma-separated)
- Use SuiNS names (automatically resolved to addresses)
- Minimum 2 addresses required

### Selection Modes

#### 1. Dry Run (Off-chain)

- Quick simulation of the selection process
- No wallet connection required
- Useful for testing and previewing

#### 2. On-chain Selection

- Requires wallet connection
- Uses Sui Network's random number generation
- Creates verifiable transaction on-chain
- Provides transaction hash for verification
- View results on Sui Explorer

### Steps to Use

1. Enter addresses or SuiNS names in the input field
2. Choose number of winners (1-100)
3. Select mode:
   - Click "Dry Run" for off-chain simulation
   - Click "Draw" for on-chain selection (requires wallet connection)
4. View results and transaction details
5. Optionally share results on Twitter

## 🔍 Transaction Verification

After an on-chain selection:

1. Transaction hash is displayed
2. Click "View on Explorer" to verify on SUI Explorer
3. All selections are permanently recorded on Sui blockchain

## 🛠️ Development

1. Check your wallet balance:

```bash
make balance
```

2. Build and deploy:

```bash
make deploy
```

3. For individual operations:

```bash
make build     # Build contracts only
make publish   # Publish contracts only
```

## 🌐 Links

- [GitHub Repository](https://github.com/your-username/sui-random-winner)
- [Documentation](https://docs.sui.io/guides/developer/advanced/randomness-onchain)
- [Twitter](https://twitter.com/GORANIAKARAN)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
