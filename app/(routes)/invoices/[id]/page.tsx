'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { formatAddress, formatAmount, formatDate, formatRelativeTime } from '@/lib/utils/format';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  chain: string;
  destinationChain: string;
  recipientAddress: string;
  payerAddress: string | null;
  creatorAddress: string;
  status: string;
  paidAt: string | null;
  bridgeTxHash: string | null;
  bridgeDirection: string | null;
  description: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  payments: Array<{
    id: string;
    txHash: string;
    bridgeTxHash: string | null;
    status: string;
    createdAt: string;
  }>;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const [copied, setCopied] = useState(false);

  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 5 seconds if pending, stop polling if paid
      if (data?.status === 'PENDING') {
        return 5000;
      }
      return false;
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExplorerUrl = (txHash: string, chain: string) => {
    if (chain === 'base') {
      return `https://basescan.org/tx/${txHash}`;
    } else {
      return `https://explorer.solana.com/tx/${txHash}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="text-primary-600 hover:text-primary-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isCrossChain = invoice.chain !== invoice.destinationChain;
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600">
                Created {formatRelativeTime(invoice.createdAt)}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[invoice.status as keyof typeof statusColors] || statusColors.PENDING
              }`}
            >
              {invoice.status}
            </span>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Amount</p>
            <p className="text-4xl font-bold text-gray-900">
              {formatAmount(invoice.amount, invoice.tokenDecimals)} {invoice.tokenSymbol}
            </p>
            {isCrossChain && (
              <p className="text-sm text-gray-600 mt-2">
                Cross-chain payment: {invoice.chain.toUpperCase()} →{' '}
                {invoice.destinationChain.toUpperCase()}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recipient Address</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                  {formatAddress(invoice.recipientAddress)}
                </code>
                <button
                  onClick={() => copyToClipboard(invoice.recipientAddress)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Source Chain</h3>
              <p className="text-sm font-semibold text-gray-900 uppercase">
                {invoice.chain}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Destination Chain</h3>
              <p className="text-sm font-semibold text-gray-900 uppercase">
                {invoice.destinationChain}
              </p>
            </div>

            {invoice.dueDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
              </div>
            )}

            {invoice.payerAddress && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Payer Address</h3>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                    {formatAddress(invoice.payerAddress)}
                  </code>
                  <button
                    onClick={() => copyToClipboard(invoice.payerAddress!)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {invoice.paidAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Paid At</h3>
                <p className="text-sm text-gray-900">{formatDate(invoice.paidAt)}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-900">{invoice.description}</p>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-gray-900">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Button */}
          {invoice.status === 'PENDING' && (
            <div className="border-t pt-6">
              <button
                onClick={() => router.push(`/invoices/${invoiceId}/pay`)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Pay Invoice
              </button>
            </div>
          )}

          {/* Bridge Transaction */}
          {invoice.bridgeTxHash && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bridge Transaction</h3>
              <a
                href={getExplorerUrl(
                  invoice.bridgeTxHash,
                  invoice.bridgeDirection === 'base-to-solana' ? 'solana' : 'base'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                {formatAddress(invoice.bridgeTxHash)}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Payments History */}
          {invoice.payments.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatRelativeTime(payment.createdAt)}
                      </p>
                      <p className="text-xs text-gray-600">
                        Status: {payment.status}
                      </p>
                    </div>
                    <a
                      href={getExplorerUrl(payment.txHash, invoice.chain)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Share Invoice */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Invoice</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/invoices/${invoiceId}` : `/invoices/${invoiceId}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/invoices/${invoiceId}` : `/invoices/${invoiceId}`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

