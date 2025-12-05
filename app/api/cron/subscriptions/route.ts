import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, addMonths, addQuarters, addYears } from 'date-fns';
import { generateInvoiceNumber } from '@/lib/utils/format';

// This endpoint should be called by a cron job to process subscriptions
// For Vercel, you can use Vercel Cron Jobs
// For other platforms, set up a cron job that calls this endpoint

function calculateNextBillingDate(
  frequency: string,
  currentDate: Date = new Date()
): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(currentDate, 1);
    case 'WEEKLY':
      return addDays(currentDate, 7);
    case 'MONTHLY':
      return addMonths(currentDate, 1);
    case 'QUARTERLY':
      return addQuarters(currentDate, 1);
    case 'YEARLY':
      return addYears(currentDate, 1);
    default:
      return addMonths(currentDate, 1);
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find all active subscriptions that are due for billing
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          lte: now, // Due date is today or in the past
        },
      },
    });

    const results = {
      processed: 0,
      invoices: [] as string[],
      errors: [] as string[],
    };

    for (const subscription of subscriptions) {
      try {
        // Create invoice for this billing cycle
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: generateInvoiceNumber(),
            amount: subscription.amount,
            tokenAddress: subscription.tokenAddress,
            tokenSymbol: subscription.tokenSymbol,
            tokenDecimals: subscription.tokenDecimals,
            chain: subscription.chain,
            destinationChain: subscription.destinationChain,
            recipientAddress: subscription.recipientAddress,
            payerAddress: subscription.payerAddress,
            creatorAddress: subscription.creatorAddress,
            status: 'PENDING',
            subscriptionId: subscription.id,
            description: `Subscription: ${subscription.name}`,
          },
        });

        // Update subscription with next billing date
        const nextBillingDate = calculateNextBillingDate(
          subscription.frequency,
          subscription.nextBillingDate
        );

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            nextBillingDate,
            lastBillingDate: now,
          },
        });

        results.processed++;
        results.invoices.push(invoice.id);

        // TODO: In production, you might want to:
        // 1. Send notification to payer
        // 2. Automatically process payment if payer has approved auto-pay
        // 3. Handle failed payments
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${subscription.id}: ${errorMsg}`);
        console.error(`Error processing subscription ${subscription.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} subscriptions`,
      ...results,
    });
  } catch (error) {
    console.error('Error in subscription cron job:', error);
    return NextResponse.json(
      { error: 'Failed to process subscriptions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

