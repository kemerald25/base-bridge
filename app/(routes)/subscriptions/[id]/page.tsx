'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Copy, Check, ExternalLink, Calendar, Repeat } from 'lucide-react';
import { formatAmount, formatDate, formatRelativeTime } from '@/lib/utils/format';
import { useState } from 'react';

interface Subscription {
  id: string;
  name: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  chain: string;
  destinationChain: string;
  recipientAddress: string;
  payerAddress: string;
  frequency: string;
  nextBillingDate: string;
  lastBillingDate: string | null;
  status: string;
  description: string | null;
  createdAt: string;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    createdAt: string;
  }>;
}

export default function SubscriptionPage() {
  const params = useParams();
  const subscriptionId = params.id as string;
  const [copied, setCopied] = useState(false);

  const { data: subscription, isLoading } = useQuery<Subscription>({
    queryKey: ['subscription', subscriptionId],
    queryFn: async () => {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Not Found</h1>
        </div>
      </div>
    );
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
  };

  const isCrossChain = subscription.chain !== subscription.destinationChain;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{subscription.name}</h1>
              <p className="text-gray-600">
                Created {formatRelativeTime(subscription.createdAt)}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusColors[subscription.status as keyof typeof statusColors] || statusColors.ACTIVE
              }`}
            >
              {subscription.status}
            </span>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Amount per Billing Cycle</p>
            <p className="text-4xl font-bold text-gray-900">
              {formatAmount(subscription.amount, subscription.tokenDecimals)} {subscription.tokenSymbol}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Billed {subscription.frequency.toLowerCase()}
            </p>
            {isCrossChain && (
              <p className="text-sm text-gray-600 mt-2">
                Cross-chain: {subscription.chain.toUpperCase()} → {subscription.destinationChain.toUpperCase()}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Billing Date
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(subscription.nextBillingDate)}
              </p>
            </div>

            {subscription.lastBillingDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Last Billing Date</h3>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(subscription.lastBillingDate)}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recipient Address</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                  {subscription.recipientAddress.slice(0, 10)}...{subscription.recipientAddress.slice(-8)}
                </code>
                <button
                  onClick={() => copyToClipboard(subscription.recipientAddress)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Payer Address</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                  {subscription.payerAddress.slice(0, 10)}...{subscription.payerAddress.slice(-8)}
                </code>
                <button
                  onClick={() => copyToClipboard(subscription.payerAddress)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          {subscription.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-900">{subscription.description}</p>
            </div>
          )}

          {/* Invoices History */}
          {subscription.invoices && subscription.invoices.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Invoice History
              </h3>
              <div className="space-y-3">
                {subscription.invoices.map((invoice) => (
                  <a
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatRelativeTime(invoice.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

