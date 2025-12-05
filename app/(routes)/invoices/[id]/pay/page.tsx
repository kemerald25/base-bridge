'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatAmount } from '@/lib/utils/format';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBridgePayment } from '@/lib/hooks/useBridgePayment';
import { useDirectPayment } from '@/lib/hooks/useDirectPayment';
import { useTokenBalance } from '@/lib/hooks/useTokenBalance';
import { Address } from 'viem';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress: string;
  chain: string;
  destinationChain: string;
  recipientAddress: string;
}

export default function PayInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const { isAuthenticated, walletAddress } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json();
    },
  });

  // Get token balance
  const tokenAddress = invoice?.tokenAddress as Address | undefined;
  const { balance, formatted: balanceFormatted, isLoading: balanceLoading } = useTokenBalance(
    tokenAddress,
    walletAddress as Address | undefined
  );

  const isCrossChain = invoice?.chain !== invoice?.destinationChain;
  
  // Bridge payment hook (for cross-chain)
  const {
    executePayment: executeBridgePayment,
    hash: bridgeTxHash,
    isPending: isBridgeProcessing,
    isSuccess: bridgeSuccess,
    error: bridgeError,
  } = useBridgePayment({
    tokenAddress: tokenAddress || ('0x0000000000000000000000000000000000000000' as Address),
    tokenDecimals: invoice?.tokenDecimals || 18,
    amount: invoice?.amount || '0',
    recipientAddress: invoice?.recipientAddress || '',
    sourceChain: (invoice?.chain as 'base' | 'solana') || 'base',
    destinationChain: (invoice?.destinationChain as 'base' | 'solana') || 'base',
  });

  // Direct payment hook (for same-chain)
  const {
    executePayment: executeDirectPayment,
    hash: directTxHash,
    isPending: isDirectProcessing,
    isSuccess: directSuccess,
    error: directError,
  } = useDirectPayment({
    tokenAddress: tokenAddress || ('0x0000000000000000000000000000000000000000' as Address),
    tokenDecimals: invoice?.tokenDecimals || 18,
    amount: invoice?.amount || '0',
    recipientAddress: (invoice?.recipientAddress as Address) || ('0x0000000000000000000000000000000000000000' as Address),
  });

  // Use appropriate payment method
  const txHash = isCrossChain ? bridgeTxHash : directTxHash;
  const isProcessing = isCrossChain ? isBridgeProcessing : isDirectProcessing;
  const paymentSuccess = isCrossChain ? bridgeSuccess : directSuccess;
  const paymentError = isCrossChain ? bridgeError : directError;

  // Record payment when transaction succeeds
  useEffect(() => {
    if (paymentSuccess && txHash && invoice) {
      const recordPayment = async () => {
        try {
          await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceId: invoice.id,
              amount: invoice.amount,
              tokenAddress: invoice.tokenAddress,
              tokenSymbol: invoice.tokenSymbol,
              chain: invoice.chain,
              txHash,
              bridgeTxHash: invoice.chain !== invoice.destinationChain ? txHash : undefined,
              bridgeDirection: invoice.chain !== invoice.destinationChain 
                ? `${invoice.chain}-to-${invoice.destinationChain}` 
                : undefined,
            }),
          });

          // Update invoice status
          await fetch(`/api/invoices/${invoiceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'PAID',
              payerAddress: walletAddress,
              bridgeTxHash: invoice.chain !== invoice.destinationChain ? txHash : undefined,
              bridgeDirection: invoice.chain !== invoice.destinationChain 
                ? `${invoice.chain}-to-${invoice.destinationChain}` 
                : undefined,
            }),
          });

          // Redirect after a short delay
          setTimeout(() => {
            router.push(`/invoices/${invoiceId}`);
          }, 2000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to record payment');
        }
      };

      recordPayment();
    }
  }, [paymentSuccess, txHash, invoice, invoiceId, walletAddress, router]);

  // Set error from payment hooks
  useEffect(() => {
    if (paymentError) {
      setError(paymentError);
    }
  }, [paymentError]);

  const handlePayment = async () => {
    if (!invoice) {
      setError('Invoice not found');
      return;
    }

    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (invoice.chain !== 'base') {
      setError('Only Base chain payments are currently supported');
      return;
    }

    // Check balance
    const amountBigInt = BigInt(invoice.amount);
    if (balance < amountBigInt) {
      setError(`Insufficient balance. You have ${balanceFormatted} ${invoice.tokenSymbol}, but need ${formatAmount(invoice.amount, invoice.tokenDecimals)} ${invoice.tokenSymbol}`);
      return;
    }

    setError(null);
    
    try {
      if (isCrossChain) {
        executeBridgePayment();
      } else {
        executeDirectPayment();
      }
    } catch (err) {
      console.error('Payment execution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute payment. Please check your wallet connection and network settings.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href={`/invoices/${invoiceId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoice
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Pay Invoice</h1>

          {/* Invoice Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Invoice #</span>
              <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatAmount(invoice.amount, invoice.tokenDecimals)} {invoice.tokenSymbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Chain</span>
              <span className="font-semibold text-gray-900 uppercase">{invoice.chain}</span>
            </div>
            {isCrossChain && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Destination Chain</span>
                  <span className="font-semibold text-gray-900 uppercase">
                    {invoice.destinationChain}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your payment will be bridged to {invoice.destinationChain.toUpperCase()}
                </p>
              </div>
            )}
          </div>

          {/* Wallet Connection */}
          {!isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Connect Wallet</h3>
                  <p className="text-sm text-yellow-700">
                    Please connect your {invoice.chain === 'base' ? 'Base' : 'Solana'} wallet to
                    proceed with payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connected Wallet Info */}
          {isAuthenticated && walletAddress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-green-700 font-medium">Wallet Connected</p>
                  <p className="text-xs text-green-600 font-mono mt-1">
                    {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                  </p>
                </div>
              </div>
              {!balanceLoading && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    Balance: {balanceFormatted} {invoice.tokenSymbol}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Success */}
          {paymentSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Payment Successful!</h3>
                  <p className="text-sm text-green-700">
                    Your payment has been processed. Redirecting...
                  </p>
                  {txHash && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_CHAIN_ID === '8453' ? 'https://basescan.org' : 'https://sepolia.basescan.org'}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-800 mt-1 inline-block"
                    >
                      View transaction →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={!isAuthenticated || isProcessing || paymentSuccess}
            className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : paymentSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Payment Successful!
              </>
            ) : (
              `Pay ${formatAmount(invoice.amount, invoice.tokenDecimals)} ${invoice.tokenSymbol}`
            )}
          </button>

          {/* Info Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            {isCrossChain
              ? 'This is a cross-chain payment. The transaction may take a few minutes to complete.'
              : 'This payment will be processed on the same chain.'}
          </p>
        </div>
      </div>
    </div>
  );
}

