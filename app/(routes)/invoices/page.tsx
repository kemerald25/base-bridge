'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { Receipt, Plus, Loader2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatAmount, formatRelativeTime, formatAddress } from '@/lib/utils/format';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  tokenSymbol: string;
  tokenDecimals: number;
  status: string;
  chain: string;
  destinationChain: string;
  recipientAddress: string;
  createdAt: string;
  paidAt: string | null;
  payments: Array<{
    id: string;
    txHash: string;
    status: string;
  }>;
}

export default function InvoicesPage() {
  const { walletAddress } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['invoices', walletAddress],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (walletAddress) {
        params.append('recipientAddress', walletAddress);
      }
      const response = await fetch(`/api/invoices?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    },
    enabled: !!walletAddress,
  });

  // Filter invoices
  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.recipientAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  }) || [];

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to view your invoices.
            </p>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">Failed to load invoices. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">
              View and manage all your invoices
            </p>
          </div>
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Found</h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : "You haven't created any invoices yet."}
            </p>
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Your First Invoice
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{invoice.invoiceNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[invoice.status as keyof typeof statusColors] ||
                          statusColors.PENDING
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatAmount(invoice.amount, invoice.tokenDecimals)} {invoice.tokenSymbol}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Recipient</p>
                        <p className="text-sm font-mono text-gray-700">
                          {formatAddress(invoice.recipientAddress)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Created</p>
                        <p className="text-sm text-gray-700">
                          {formatRelativeTime(invoice.createdAt)}
                        </p>
                      </div>
                    </div>
                    {invoice.chain !== invoice.destinationChain && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Cross-chain: {invoice.chain.toUpperCase()} → {invoice.destinationChain.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {invoice.status === 'PENDING' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                        Pay Now
                      </span>
                    )}
                    {invoice.paidAt && (
                      <p className="text-xs text-gray-500">
                        Paid {formatRelativeTime(invoice.paidAt)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        {invoices && invoices.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter((i) => i.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter((i) => i.status === 'PAID').length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {invoices.filter((i) => i.status === 'OVERDUE').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

