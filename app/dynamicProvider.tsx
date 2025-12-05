"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { PropsWithChildren } from "react";
import { base, baseSepolia } from "viem/chains";

export function DynamicProvider({ children }: PropsWithChildren) {
  const envId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  // Only render if environmentId is provided
  if (!envId) {
    return <>{children}</>;
  }

  // Determine which chain to use based on environment
  const chainId = process.env.NEXT_PUBLIC_BASE_CHAIN_ID;
  const chain = chainId === '8453' ? base : baseSepolia;
  
  // Use environment variable for RPC URL or fallback to public RPC
  const baseRpcUrl =
    process.env.NEXT_PUBLIC_BASE_RPC_URL ?? 
    chain.rpcUrls.default.http[0];
  const baseRpcUrls = [baseRpcUrl];

  return (
    <DynamicContextProvider
      settings={{
        environmentId: envId,
        walletConnectors: [
          (props) => EthereumWalletConnectors({ ...props, useMetamaskSdk: false }),
        ],
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: chain.blockExplorers?.default?.url
                ? [chain.blockExplorers.default.url]
                : [],
              chainId: chain.id,
              iconUrls: [],
              name: chain.name,
              nativeCurrency: chain.nativeCurrency,
              networkId: chain.id,
              rpcUrls: baseRpcUrls,
            },
          ],
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

