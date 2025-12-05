import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, bridgeTxHash, confirmedAt } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (bridgeTxHash) updateData.bridgeTxHash = bridgeTxHash;
    if (confirmedAt) updateData.confirmedAt = new Date(confirmedAt);
    if (status === 'CONFIRMED' && !confirmedAt) {
      updateData.confirmedAt = new Date();
    }

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

