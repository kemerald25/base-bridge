'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getBaseAddresses } from '../contracts/addresses';
import { prepareBridgeToSolana, parseTokenAmount } from '../bridge/base';
import { Address } from 'viem';

interface UseBridgePaymentParams {
  tokenAddress: Address;
  tokenDecimals: number;
  amount: string;
  recipientAddress: string;
  sourceChain: 'base' | 'solana';
  destinationChain: 'base' | 'solana';
}

export function useBridgePayment(params: UseBridgePaymentParams) {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bridgeAddress = getBaseAddresses().BRIDGE as Address;

  // Prepare bridge parameters
  const bridgeParams = params.sourceChain === 'base' && params.destinationChain === 'solana'
    ? prepareBridgeToSolana({
        tokenAddress: params.tokenAddress,
        solanaRecipient: params.recipientAddress,
        amount: params.amount,
        decimals: params.tokenDecimals,
      })
    : null;

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const executePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Same-chain payment (Base → Base) - direct transfer
      if (params.sourceChain === 'base' && params.destinationChain === 'base') {
        // For same-chain, we need to use a different approach
        // For now, we'll use a simple ERC20 transfer or native ETH transfer
        const isNative = params.tokenAddress === '0x0000000000000000000000000000000000000000';
        
        if (isNative) {
          // Native ETH transfer - use sendTransaction instead
          setError('Native ETH transfers not yet implemented. Please use ERC20 tokens.');
          setIsProcessing(false);
          return;
        }

        // ERC20 transfer - we'll need to implement this
        setError('Same-chain ERC20 transfers not yet implemented. Please use cross-chain payments.');
        setIsProcessing(false);
        return;
      }

      // Cross-chain payment (Base → Solana)
      if (params.sourceChain !== 'base' || params.destinationChain !== 'solana') {
        setError('Only Base → Solana cross-chain payments are currently supported');
        setIsProcessing(false);
        return;
      }

      if (!bridgeParams) {
        setError('Invalid bridge parameters');
        setIsProcessing(false);
        return;
      }

      // Execute bridge transaction
      try {
        writeContract({
          address: bridgeAddress,
          abi: [
            {
              name: 'bridgeToken',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                {
                  name: 'transfer',
                  type: 'tuple',
                  components: [
                    { name: 'localToken', type: 'address' },
                    { name: 'remoteToken', type: 'bytes32' },
                    { name: 'to', type: 'bytes32' },
                    { name: 'remoteAmount', type: 'uint256' },
                  ],
                },
                {
                  name: 'calls',
                  type: 'tuple[]',
                  components: [
                    { name: 'target', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'data', type: 'bytes' },
                  ],
                },
              ],
              outputs: [],
            },
          ],
          functionName: 'bridgeToken',
          args: [
            {
              localToken: bridgeParams.localToken,
              remoteToken: bridgeParams.remoteToken,
              to: bridgeParams.to,
              remoteAmount: bridgeParams.remoteAmount,
            },
            [], // No additional calls
          ],
        });
      } catch (writeErr) {
        console.error('writeContract error:', writeErr);
        throw writeErr;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please check your wallet connection and try again.');
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

