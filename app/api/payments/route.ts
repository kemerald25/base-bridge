import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.string(),
  tokenAddress: z.string(),
  tokenSymbol: z.string(),
  chain: z.enum(['base', 'solana']),
  txHash: z.string(),
  bridgeTxHash: z.string().optional(),
  bridgeDirection: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount,
        tokenAddress: data.tokenAddress,
        tokenSymbol: data.tokenSymbol,
        chain: data.chain,
        txHash: data.txHash,
        bridgeTxHash: data.bridgeTxHash,
        bridgeDirection: data.bridgeDirection,
        status: 'PENDING',
      },
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        bridgeTxHash: data.bridgeTxHash,
        bridgeDirection: data.bridgeDirection,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get('invoiceId');

    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: true,
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

