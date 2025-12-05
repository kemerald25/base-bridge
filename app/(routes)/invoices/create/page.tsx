'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const invoiceSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  tokenSymbol: z.string().min(1, 'Token symbol is required'),
  tokenAddress: z.string().min(1, 'Token address is required'),
  tokenDecimals: z.number().int().positive(),
  chain: z.enum(['base', 'solana']),
  destinationChain: z.enum(['base', 'solana']),
  recipientAddress: z.string().min(1, 'Recipient address is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Common tokens
const COMMON_TOKENS = {
  base: [
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'SOL', address: '0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82', decimals: 9 },
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  ],
  solana: [
    { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', decimals: 9 },
    { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  ],
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      chain: 'base',
      destinationChain: 'base',
      tokenDecimals: 18,
    },
  });

  const selectedChain = watch('chain');
  const selectedToken = watch('tokenAddress');

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get creator address from wallet (simplified - in production, get from connected wallet)
      const creatorAddress = '0x0000000000000000000000000000000000000000'; // Placeholder

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          creatorAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const invoice = await response.json();
      router.push(`/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTokens = (selectedChain && COMMON_TOKENS[selectedChain as keyof typeof COMMON_TOKENS]) || [];
  const selectedTokenInfo = availableTokens.find((t) => t.address === selectedToken);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Invoice</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="text"
                {...register('amount')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.0"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Source Chain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Chain (Where payment comes from)
              </label>
              <select
                {...register('chain')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="base">Base</option>
                <option value="solana">Solana</option>
              </select>
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <select
                {...register('tokenAddress')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a token</option>
                {availableTokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              {selectedTokenInfo && (
                <>
                  <input
                    type="hidden"
                    {...register('tokenSymbol', { value: selectedTokenInfo.symbol })}
                  />
                  <input
                    type="hidden"
                    {...register('tokenDecimals', { value: selectedTokenInfo.decimals })}
                  />
                </>
              )}
              {errors.tokenAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.tokenAddress.message}</p>
              )}
            </div>

            {/* Destination Chain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Chain (Where you want to receive)
              </label>
              <select
                {...register('destinationChain')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="base">Base</option>
                <option value="solana">Solana</option>
              </select>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                {...register('recipientAddress')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="0x... or Solana pubkey"
              />
              {errors.recipientAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.recipientAddress.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Invoice description..."
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

