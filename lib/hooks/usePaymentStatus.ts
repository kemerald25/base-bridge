'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface PaymentStatus {
  status: string;
  confirmedAt: string | null;
  txHash: string;
  bridgeTxHash: string | null;
}

/**
 * Hook to track payment status by polling the API
 */
export function usePaymentStatus(paymentId: string | null, enabled: boolean = true) {
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const { data: payment, isLoading, refetch } = useQuery<PaymentStatus>({
    queryKey: ['payment-status', paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      const response = await fetch(`/api/payments?invoiceId=${paymentId}`);
      if (!response.ok) throw new Error('Failed to fetch payment status');
      const payments = await response.json();
      return payments[0] || null;
    },
    enabled: enabled && !!paymentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 5 seconds if pending, stop polling if confirmed
      if (data?.status === 'PENDING') {
        return 5000;
      }
      return false;
    },
  });

  // Track status changes
  useEffect(() => {
    if (payment?.status && payment.status !== lastStatus) {
      setLastStatus(payment.status);
      
      // Optional: Trigger callback or notification when status changes
      if (payment.status === 'CONFIRMED') {
        // Payment confirmed - could trigger notification here
        console.log('Payment confirmed:', payment.txHash);
      } else if (payment.status === 'FAILED') {
        // Payment failed - could trigger notification here
        console.log('Payment failed:', payment.txHash);
      }
    }
  }, [payment?.status, lastStatus]);

  return {
    payment,
    isLoading,
    status: payment?.status || 'PENDING',
    isConfirmed: payment?.status === 'CONFIRMED',
    isFailed: payment?.status === 'FAILED',
    isPending: payment?.status === 'PENDING',
    refetch,
  };
}

/**
 * Hook to track invoice payment status
 */
export function useInvoicePaymentStatus(invoiceId: string | null) {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice-payment-status', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json();
    },
    enabled: !!invoiceId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Poll every 5 seconds if pending, stop polling if paid
      if (data?.status === 'PENDING') {
        return 5000;
      }
      return false;
    },
  });

  return {
    invoice,
    isLoading,
    status: invoice?.status || 'PENDING',
    isPaid: invoice?.status === 'PAID',
    isPending: invoice?.status === 'PENDING',
    payments: invoice?.payments || [],
  };
}

