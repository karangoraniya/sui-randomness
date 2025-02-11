# Sui On-Chain Randomness 🎲

A decentralized random winner selector built on Sui Network that leverages on-chain randomness for transparent and verifiable selection processes.

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

## 🚀 Demo

Try it out: [Live Demo](https://suirandom.vercel.app/)

## 💻 Installation

1. Clone the repository:

```bash
git clone git@github.com:karangoraniya/sui-randomness.git
cd sui-randomness/sui-random-fe
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
