# Sui Random Winner Contract 🎲

A decentralized smart contract on Sui Network that leverages on-chain randomness for transparent and verifiable winner
selection.

## Features

- On-chain randomness
- Multiple winner selection
- Verifiable random selection
- Event emission

## ⚠️ Prerequisites

- Sui CLI
- Move compiler
- Sui testnet/devnet account

## Functions

- `select_winners`: Main function for random selection
- Emits events with selected winners
- Uses Sui's secure random number generation

## 🚀 Quick Start

```bash
# Navigate to contract directory
cd contract

# Build and deploy
./deploy.sh all
```

## 📋 Available Commands

The `deploy.sh` script provides several commands:

```bash
./deploy.sh all       # Run everything (build, publish, start frontend)
./deploy.sh balance   # Check wallet balance
./deploy.sh build     # Build the contract
./deploy.sh publish   # Publish the contract
./deploy.sh deploy    # Build and publish the contract
./deploy.sh frontend  # Start frontend only
./deploy.sh help      # Show help message
```

Or use Make commands from the root directory:

```bash
make           # Deploy everything
make deploy    # Same as above
make build     # Only build contract
make publish   # Only publish contract
make balance   # Check wallet balance
```

## 💡 Contract Details

## 🔧 Development

1. Check your balance before deployment:

```bash
make balance
```

2. Build the contract:

```bash
make build
```

3. Publish the contract:

```bash
make publish
```

4. Or do everything at once:

```bash
make all
```

## 🧪 Testing

```bash
sui move test
```

## 📝 Contract Addresses

- [Testnet](https://testnet.suivision.xyz/package/0xde6dde8c563f08a62410e1702a3138ecbded82dc6e61dc24ba8490fff970ea09)

## 📚 Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Move Language Documentation](https://move-language.github.io/move/)
