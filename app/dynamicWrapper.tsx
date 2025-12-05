"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { ComponentProps, PropsWithChildren, useMemo } from "react";
import { DynamicProvider } from "./dynamicProvider";

type MinimalDynamicProviderProps = PropsWithChildren &
  Partial<ComponentProps<typeof DynamicContextProvider>>;

function MinimalDynamicProvider({ children }: MinimalDynamicProviderProps) {
  const envId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  // Only render Dynamic if environmentId is provided
  if (!envId) {
    return <>{children}</>;
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: envId,
        walletConnectors: [],
        appName: "Base Bridge",
        appLogoUrl: "",
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}

export function DynamicWrapper({ children }: PropsWithChildren) {
  const { context } = useMiniKit();
  const isMiniApp = useMemo(() => Boolean(context), [context]);
  const envId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  // In Mini App mode, use minimal provider or skip if no envId
  if (isMiniApp) {
    return <MinimalDynamicProvider>{children}</MinimalDynamicProvider>;
  }

  // In regular web mode, only use Dynamic if envId is provided
  if (!envId) {
    // Fallback: just render children without Dynamic
    // Wallet connection will work via OnchainKit/wagmi
    return <>{children}</>;
  }

  return <DynamicProvider>{children}</DynamicProvider>;
}

