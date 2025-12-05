'use client';

import { useWalletConnection } from './useWalletConnection';
import { useCallback } from 'react';

export function useAuth() {
  const { address, isConnected, isConnecting, connect, disconnect, connectors } = useWalletConnection();

  const connectWallet = useCallback(() => {
    if (connectors && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    isAuthenticated: isConnected,
    walletAddress: address,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
}
