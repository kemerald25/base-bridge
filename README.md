# Base-Solana Cross-Chain Payment & Invoicing System

A comprehensive payment and invoicing platform that enables cross-chain payments between Base and Solana networks. Pay invoices, set up recurring subscriptions, and automate payments across both ecosystems.

## Features

- 💰 **Cross-Chain Invoices**: Create invoices payable with Base or Solana assets
- 🔄 **Bidirectional Payments**: Pay on Base with Solana assets and vice versa
- 🔁 **Recurring Subscriptions**: Set up automated recurring payments
- 📊 **Payment Dashboard**: Track all invoices, payments, and subscriptions
- 🔐 **Multi-Wallet Support**: Connect both Base (Ethereum) and Solana wallets
- 📱 **Real-time Status**: Track payment and bridge transaction status
- 🎯 **Business Ready**: Perfect for freelancers, businesses, and DAOs

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite (easily upgradeable to PostgreSQL)
- **Blockchain**: 
  - Base: wagmi, viem, ethers.js
  - Solana: @solana/web3.js, @solana/wallet-adapter
- **Bridge**: Base-Solana Bridge (Chainlink CCIP + Coinbase)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Base RPC endpoint (or use public RPC)
- A Solana RPC endpoint (or use public RPC)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/base-bridge.git
cd base-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
base-bridge/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── invoices/         # Invoice-related components
│   ├── payments/         # Payment components
│   ├── subscriptions/    # Subscription components
│   └── wallets/          # Wallet connection components
├── lib/                   # Utilities and helpers
│   ├── bridge/           # Bridge integration
│   ├── contracts/        # Contract ABIs and addresses
│   └── utils/            # General utilities
├── prisma/               # Database schema
└── public/               # Static assets
```

## Usage

### Creating an Invoice

1. Connect your wallet (Base or Solana)
2. Navigate to "Create Invoice"
3. Fill in:
   - Amount and token
   - Source chain (where payment comes from)
   - Destination chain (where you want to receive)
   - Recipient address
   - Optional: Description, due date
4. Generate invoice and share the link

### Paying an Invoice

1. Open the invoice link
2. Connect your wallet (matching the source chain)
3. Review invoice details
4. Click "Pay Invoice"
5. Approve the bridge transaction
6. Wait for confirmation

### Setting Up Subscriptions

1. Navigate to "Subscriptions"
2. Click "Create Subscription"
3. Configure:
   - Amount and frequency
   - Source and destination chains
   - Recipient address
4. Share subscription link with payer
5. Payer connects wallet and approves
6. Payments are automated based on schedule

## Bridge Integration

This app integrates with the Base-Solana Bridge:

- **Base → Solana**: Burn tokens on Base, generate Merkle proof, unlock on Solana
- **Solana → Base**: Lock tokens on Solana, validators approve, mint on Base

See the [Base Bridge Documentation](https://docs.base.org/bridge) for more details.

## Contract Addresses

### Base Mainnet
- Bridge: `0x3eff766C76a1be2Ce1aCF2B69c78bCae257D5188`
- Bridge Validator: `0xAF24c1c24Ff3BF1e6D882518120fC25442d6794B`
- SOL on Base: `0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82`

### Solana Mainnet
- Bridge Program: `HNCne2FkVaNghhjKXapxJzPaBvAKDG1Ge3gqhZyfVWLM`
- Relayer Program: `g1et5VenhfJHJwsdJsDbxWZuotD5H4iELNG61kS4fb9`

## Development

### Database

View database in Prisma Studio:
```bash
npm run db:studio
```

### Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
