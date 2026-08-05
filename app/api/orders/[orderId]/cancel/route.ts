import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { orderId } = resolvedParams;

    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    order.status = 'CANCELLED';
    
    // Set all pending/negotiating/needs_review to canceled
    order.allocations.forEach((allocation: any) => {
      if (['PENDING', 'NEGOTIATING', 'NEEDS_REVIEW'].includes(allocation.status)) {
        allocation.status = 'CANCELED';
      }
    });

    await order.save();

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    console.error('Cancel Order Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
