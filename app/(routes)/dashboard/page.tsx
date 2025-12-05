'use client';

import { useQuery } from '@tanstack/react-query';
import { Receipt, CreditCard, Repeat, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatAmount, formatRelativeTime } from '@/lib/utils/format';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  status: string;
  createdAt: string;
  recipientAddress: string;
  chain: string;
  destinationChain: string;
}

interface Subscription {
  id: string;
  name: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  status: string;
  nextBillingDate: string;
  frequency: string;
}

export default function DashboardPage() {
  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    },
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      return response.json();
    },
  });

  const pendingInvoices = invoices?.filter((inv) => inv.status === 'PENDING') || [];
  const paidInvoices = invoices?.filter((inv) => inv.status === 'PAID') || [];
  const activeSubscriptions = subscriptions?.filter((sub) => sub.status === 'ACTIVE') || [];

  const stats = [
    {
      name: 'Total Invoices',
      value: invoices?.length || 0,
      icon: Receipt,
      color: 'text-blue-600',
    },
    {
      name: 'Pending Payments',
      value: pendingInvoices.length,
      icon: CreditCard,
      color: 'text-yellow-600',
    },
    {
      name: 'Paid Invoices',
      value: paidInvoices.length,
      icon: CreditCard,
      color: 'text-green-600',
    },
    {
      name: 'Active Subscriptions',
      value: activeSubscriptions.length,
      icon: Repeat,
      color: 'text-purple-600',
    },
  ];

  if (invoicesLoading || subscriptionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Invoices</h2>
              <Link
                href="/invoices/create"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Create New
              </Link>
            </div>
            {invoices && invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatAmount(invoice.amount, invoice.tokenDecimals)}{' '}
                          {invoice.tokenSymbol}
                        </p>
                      </div>
                      <div className="text-right">
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
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(invoice.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No invoices yet</p>
                <Link
                  href="/invoices/create"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create your first invoice
                </Link>
              </div>
            )}
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Subscriptions</h2>
              <Link
                href="/subscriptions/create"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Create New
              </Link>
            </div>
            {subscriptions && subscriptions.length > 0 ? (
              <div className="space-y-4">
                {activeSubscriptions.slice(0, 5).map((subscription) => (
                  <div
                    key={subscription.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{subscription.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatAmount(subscription.amount, subscription.tokenDecimals)}{' '}
                          {subscription.tokenSymbol} / {subscription.frequency.toLowerCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {subscription.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Next: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No active subscriptions</p>
                <Link
                  href="/subscriptions/create"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Create a subscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

