import { NextRequest, NextResponse } from 'next/server';
import { processVendorReply } from '@/services/replyHandler';

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    const vendorId = request.nextUrl.searchParams.get('vendorId');
    const replyText = request.nextUrl.searchParams.get('replyText');

    if (!orderId || !vendorId || !replyText) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const updatedOrder = await processVendorReply(orderId, vendorId, replyText);
    
    return NextResponse.json({ success: true, data: updatedOrder }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
