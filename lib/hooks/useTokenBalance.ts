'use client';

import { useReadContract, useBalance } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { getBaseAddresses } from '../contracts/addresses';

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export function useTokenBalance(tokenAddress: Address | undefined, userAddress: Address | undefined) {
  const isNative = !tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';
  
  // For native ETH
  const { data: nativeBalance } = useBalance({
    address: userAddress,
    enabled: isNative && !!userAddress,
  });

  // For ERC20 tokens
  const { data: tokenBalance, isLoading } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    enabled: !isNative && !!tokenAddress && !!userAddress,
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    enabled: !isNative && !!tokenAddress,
  });

  if (isNative) {
    return {
      balance: nativeBalance?.value || BigInt(0),
      formatted: nativeBalance?.formatted || '0',
      decimals: 18,
      isLoading: !nativeBalance,
    };
  }

  const formatted = tokenBalance && decimals
    ? formatUnits(tokenBalance, decimals)
    : '0';

  return {
    balance: tokenBalance || BigInt(0),
    formatted,
    decimals: decimals || 18,
    isLoading,
  };
}

