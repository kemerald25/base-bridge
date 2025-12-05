'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useMemo } from 'react';

export function useWalletConnection() {
  const { context } = useMiniKit();
  const isMiniApp = useMemo(() => Boolean(context), [context]);
  
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    address: address || undefined,
    isConnected,
    isConnecting,
    isMiniApp,
    connect,
    disconnect,
    connectors,
  };
}
