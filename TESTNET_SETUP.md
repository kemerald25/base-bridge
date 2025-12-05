# Testnet Setup Guide

## Base Sepolia Testnet Configuration

To use the testnet, update your `.env` file with these values:

```env
# Base Sepolia Testnet
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

# Solana Devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## Testnet Contract Addresses

### Base Sepolia
- Bridge: `0x01824a90d32A69022DdAEcC6C5C14Ed08dB4EB9B`
- Bridge Validator: `0xa80C07DF38fB1A5b3E6a4f4FAAB71E7a056a4EC7`
- SOL on Base: `0xCace0c896714DaF7098FFD8CC54aFCFe0338b4BC`

### Solana Devnet
- Bridge Program: `7c6mteAcTXaQ1MFBCrnuzoZVTTAEfZwa6wgy4bqX3KXC`
- Relayer Program: `56MBBEYAtQAdjT4e1NzHD8XaoyRSTvfgbSVVcEcHj51H`

## Getting Testnet Tokens

### Base Sepolia ETH
- Use the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- Or use [Alchemy Base Sepolia Faucet](https://sepoliafaucet.com/)

### Solana Devnet SOL
- Use the [Solana Faucet](https://faucet.solana.com/)
- Select "Devnet" network

## Switching Between Mainnet and Testnet

1. Update `.env` file with the appropriate values
2. Restart your development server: `npm run dev`
3. Make sure your wallet is connected to the correct network

## Troubleshooting

### Wallet Not Connecting
- Make sure your wallet (MetaMask, etc.) is connected to Base Sepolia network
- Add Base Sepolia network to your wallet if needed:
  - Network Name: Base Sepolia
  - RPC URL: https://sepolia.base.org
  - Chain ID: 84532
  - Currency Symbol: ETH
  - Block Explorer: https://sepolia.basescan.org

### Transaction Errors
- Ensure you have testnet tokens
- Check that contract addresses match the network
- Verify your wallet is on the correct network

