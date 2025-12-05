'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { parseUnits, Address, encodeFunctionData } from 'viem';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

interface UseDirectPaymentParams {
  tokenAddress: Address;
  tokenDecimals: number;
  amount: string;
  recipientAddress: Address;
}

/**
 * Hook for same-chain direct payments (Base → Base)
 */
export function useDirectPayment(params: UseDirectPaymentParams) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isNative = params.tokenAddress === '0x0000000000000000000000000000000000000000';

  // For native ETH
  const { sendTransaction: sendNativeTx, data: nativeHash, isPending: isNativePending, error: nativeError } = useSendTransaction();
  
  // For ERC20 tokens
  const { writeContract, data: tokenHash, isPending: isTokenPending, error: tokenError } = useWriteContract();
  
  const hash = isNative ? nativeHash : tokenHash;
  const isPending = isNative ? isNativePending : isTokenPending;
  const writeError = isNative ? nativeError : tokenError;

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const executePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const amount = parseUnits(params.amount, params.tokenDecimals);

      if (isNative) {
        // Native ETH transfer
        sendNativeTx({
          to: params.recipientAddress,
          value: amount,
        });
      } else {
        // ERC20 token transfer
        writeContract({
          address: params.tokenAddress,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [params.recipientAddress, amount],
        });
      }
    } catch (err) {
      console.error('Direct payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  // Update processing state when transaction completes
  if (isSuccess && isProcessing) {
    setIsProcessing(false);
  }

  if (writeError) {
    setError(writeError.message);
    setIsProcessing(false);
  }

  return {
    executePayment,
    hash,
    isPending: isPending || isConfirming || isProcessing,
    isSuccess,
    error: error || (writeError ? writeError.message : null),
  };
}

