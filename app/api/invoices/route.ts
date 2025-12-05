import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoiceNumber } from '@/lib/utils/format';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  amount: z.string(),
  tokenAddress: z.string(),
  tokenSymbol: z.string(),
  tokenDecimals: z.number().int().positive(),
  chain: z.enum(['base', 'solana']),
  destinationChain: z.enum(['base', 'solana']),
  recipientAddress: z.string(),
  creatorAddress: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInvoiceSchema.parse(body);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        amount: data.amount,
        tokenAddress: data.tokenAddress,
        tokenSymbol: data.tokenSymbol,
        tokenDecimals: data.tokenDecimals,
        chain: data.chain,
        destinationChain: data.destinationChain,
        recipientAddress: data.recipientAddress,
        creatorAddress: data.creatorAddress,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
        status: 'PENDING',
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipientAddress = searchParams.get('recipientAddress');
    const creatorAddress = searchParams.get('creatorAddress');
    const status = searchParams.get('status');

    const where: any = {};
    if (recipientAddress) where.recipientAddress = recipientAddress;
    if (creatorAddress) where.creatorAddress = creatorAddress;
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

