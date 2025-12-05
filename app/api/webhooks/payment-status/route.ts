import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook endpoint for payment status updates
 * Can be called by external services (e.g., bridge validators, indexers) to update payment status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, invoiceId, txHash, status, bridgeTxHash } = body;

    // Verify webhook secret (optional but recommended)
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update payment status
    if (paymentId) {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: status || 'CONFIRMED',
          confirmedAt: status === 'CONFIRMED' ? new Date() : undefined,
          bridgeTxHash: bridgeTxHash || undefined,
        },
      });

      // Update invoice status if payment is confirmed
      if (status === 'CONFIRMED' && payment.invoiceId) {
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true, payment });
    }

    // Update by invoice ID and txHash
    if (invoiceId && txHash) {
      const payment = await prisma.payment.findFirst({
        where: {
          invoiceId,
          txHash,
        },
      });

      if (payment) {
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: status || 'CONFIRMED',
            confirmedAt: status === 'CONFIRMED' ? new Date() : undefined,
            bridgeTxHash: bridgeTxHash || undefined,
          },
        });

        // Update invoice status
        if (status === 'CONFIRMED') {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });
        }

        return NextResponse.json({ success: true, payment: updated });
      }
    }

    return NextResponse.json(
      { error: 'Missing required fields: paymentId or (invoiceId + txHash)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

