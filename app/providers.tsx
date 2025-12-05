'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'viem/chains';
import { useState } from 'react';
import { SafeArea } from '@coinbase/onchainkit/minikit';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { DynamicWrapper } from './dynamicWrapper';

// Determine which chain to use based on environment
const chainId = process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
// Support both string and number comparison
const isMainnet = chainId === '8453' || chainId === 8453;
const chain = isMainnet ? base : baseSepolia;
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || chain.rpcUrls.default.http[0];

// Extract API key from RPC URL for OnchainKit
// OnchainKit uses the API key to construct its RPC URLs, so we extract it from the provided URL
const rpcApiKey = rpcUrl.split('/').pop() || '';
const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? rpcApiKey;

// Create wagmi config
const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpcUrl),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <OnchainKitProvider
      apiKey={apiKey}
      chain={chain}
      config={{
        appearance: {
          name: 'Base Bridge',
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: false,
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <SafeArea>
            <div className="min-h-screen bg-background text-foreground">
              <DynamicWrapper>
                {children}
              </DynamicWrapper>
            </div>
          </SafeArea>
        </QueryClientProvider>
      </WagmiProvider>
    </OnchainKitProvider>
  );
}

