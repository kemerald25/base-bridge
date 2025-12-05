"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { WalletConnection } from "./wallet-connection";
import { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * AuthGuard component that protects routes/components requiring authentication
 * Shows wallet connection UI if user is not authenticated
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isConnecting } = useAuth();

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting wallet...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Please connect your wallet to access this feature.
          </p>
          <WalletConnection fullWidth />
        </div>
      )
    );
  }

  return <>{children}</>;
}

