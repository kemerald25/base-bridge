import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { addDays, addMonths, addQuarters, addYears } from 'date-fns';

const createSubscriptionSchema = z.object({
  name: z.string(),
  amount: z.string(),
  tokenAddress: z.string(),
  tokenSymbol: z.string(),
  tokenDecimals: z.number().int().positive(),
  chain: z.enum(['base', 'solana']),
  destinationChain: z.enum(['base', 'solana']),
  recipientAddress: z.string(),
  payerAddress: z.string(),
  creatorAddress: z.string(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  description: z.string().optional(),
});

function calculateNextBillingDate(
  frequency: string,
  startDate: Date = new Date()
): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(startDate, 1);
    case 'WEEKLY':
      return addDays(startDate, 7);
    case 'MONTHLY':
      return addMonths(startDate, 1);
    case 'QUARTERLY':
      return addQuarters(startDate, 1);
    case 'YEARLY':
      return addYears(startDate, 1);
    default:
      return addMonths(startDate, 1);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSubscriptionSchema.parse(body);

    const nextBillingDate = calculateNextBillingDate(data.frequency);

    const subscription = await prisma.subscription.create({
      data: {
        name: data.name,
        amount: data.amount,
        tokenAddress: data.tokenAddress,
        tokenSymbol: data.tokenSymbol,
        tokenDecimals: data.tokenDecimals,
        chain: data.chain,
        destinationChain: data.destinationChain,
        recipientAddress: data.recipientAddress,
        payerAddress: data.payerAddress,
        creatorAddress: data.creatorAddress,
        frequency: data.frequency,
        nextBillingDate,
        status: 'ACTIVE',
        description: data.description,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipientAddress = searchParams.get('recipientAddress');
    const payerAddress = searchParams.get('payerAddress');
    const status = searchParams.get('status');

    const where: any = {};
    if (recipientAddress) where.recipientAddress = recipientAddress;
    if (payerAddress) where.payerAddress = payerAddress;
    if (status) where.status = status;

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

