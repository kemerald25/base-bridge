# Dynamic Wallet Authentication Setup

This project uses Dynamic Labs for wallet authentication, with MiniKit (OnchainKit) support for Coinbase Mini Apps, matching the implementation in `gmcoin-v2`.

## Overview

The authentication system provides:
- **Dynamic Wallet Connection**: Support for multiple wallet providers (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- **MiniKit Integration**: Automatic support for Coinbase Mini Apps via OnchainKit
- **Dual Mode Support**: Automatically detects Mini App context and uses appropriate wallet connection method
- **Unified Wallet Access**: Single hook (`useAuth`) for accessing wallet state
- **Base Chain Support**: Configured for Base mainnet/testnet
- **Type-Safe**: Full TypeScript support

## Environment Variables

Add these to your `.env.local` file:

```env
# Dynamic Labs Environment ID (get from https://app.dynamic.xyz)
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_environment_id_here

# Base RPC URL (optional, defaults to public RPC)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Base Chain ID (8453 for mainnet, 84532 for Sepolia testnet)
NEXT_PUBLIC_BASE_CHAIN_ID=8453

# OnchainKit API Key (optional, extracted from RPC URL if not provided)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
```

## Usage

### Basic Wallet Connection

```tsx
import { WalletConnection } from '@/components/wallet-connection';

export default function MyPage() {
  return (
    <div>
      <WalletConnection />
    </div>
  );
}
```

### Using Authentication Hook

```tsx
"use client";

import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { isAuthenticated, walletAddress, connectWallet, disconnectWallet } = useAuth();

  if (!isAuthenticated) {
    return (
      <button onClick={connectWallet}>
        Connect Wallet
      </button>
    );
  }

  return (
    <div>
      <p>Connected: {walletAddress}</p>
      <button onClick={disconnectWallet}>
        Disconnect
      </button>
    </div>
  );
}
```

### Protected Routes/Components

```tsx
import { AuthGuard } from '@/components/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>
        {/* This content only shows when wallet is connected */}
        <h1>Protected Content</h1>
      </div>
    </AuthGuard>
  );
}
```

### Using Wallet Connection Directly

```tsx
"use client";

import { useWalletConnection } from '@/lib/hooks/useWalletConnection';

export default function MyComponent() {
  const { address, isConnected, isConnecting } = useWalletConnection();

  if (isConnecting) return <p>Connecting...</p>;
  if (!isConnected) return <p>Not connected</p>;

  return <p>Address: {address}</p>;
}
```

## Architecture

### Components

- **`app/dynamicProvider.tsx`**: Sets up Dynamic Labs with Ethereum wallet connectors for regular web usage
- **`app/dynamicWrapper.tsx`**: Wrapper that conditionally renders providers based on Mini App context
- **`components/wallet-connection.tsx`**: UI component that automatically switches between Mini App and regular wallet modes
- **`components/auth-guard.tsx`**: Component that protects content behind authentication

### Hooks

- **`lib/hooks/useWalletConnection.ts`**: Low-level hook for wallet connection state (uses wagmi + Dynamic, with MiniKit support)
- **`lib/hooks/useAuth.ts`**: High-level authentication hook with connect/disconnect methods

### Providers

- **`app/providers.tsx`**: Main provider setup including OnchainKitProvider, WagmiProvider, QueryClientProvider, and DynamicWrapper

## Features

1. **Multi-Wallet Support**: Users can connect with MetaMask, WalletConnect, Coinbase Wallet, and more
2. **Mini App Support**: Automatic detection and support for Coinbase Mini Apps via OnchainKit
3. **Dual Mode Operation**: Seamlessly switches between Mini App mode (OnchainKit) and regular web mode (Dynamic)
4. **Base Chain Integration**: Automatically configured for Base network
5. **Type Safety**: Full TypeScript support throughout
6. **React Query Integration**: Already integrated with your existing QueryClient setup

## Getting Your Dynamic Environment ID

1. Go to [Dynamic Labs Dashboard](https://app.dynamic.xyz)
2. Create a new project or select an existing one
3. Copy your Environment ID
4. Add it to your `.env.local` file

## How It Works

The authentication system automatically detects the context:

1. **Mini App Mode**: When running in a Coinbase Mini App, it uses OnchainKit's wallet connection (via wagmi)
2. **Regular Web Mode**: When running in a regular browser, it uses Dynamic Labs for wallet connection

The `useWalletConnection` hook and `WalletConnection` component automatically handle this switching, so you don't need to write different code for different contexts.

## Notes

- The system is configured for Base mainnet by default
- To switch to testnet, set `NEXT_PUBLIC_BASE_CHAIN_ID=84532` (Base Sepolia)
- The wallet connection persists across page refreshes
- Mini App mode is automatically detected via OnchainKit's `useMiniKit` hook
- Regular web mode uses Dynamic Labs SDK for multi-wallet support
- This implementation matches the pattern used in `gmcoin-v2`

