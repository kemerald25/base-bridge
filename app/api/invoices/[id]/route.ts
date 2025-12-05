import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        subscription: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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
    const { status, bridgeTxHash, bridgeDirection, payerAddress } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (bridgeTxHash) updateData.bridgeTxHash = bridgeTxHash;
    if (bridgeDirection) updateData.bridgeDirection = bridgeDirection;
    if (payerAddress) updateData.payerAddress = payerAddress;
    if (status === 'PAID') updateData.paidAt = new Date();

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

