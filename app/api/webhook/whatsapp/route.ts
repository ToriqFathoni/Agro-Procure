import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';
import { Order } from '@/models/Order';
import { processVendorReply } from '@/services/replyHandler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, replyText } = body;

    if (!phone || !replyText) {
      return NextResponse.json({ success: false, error: 'Missing phone or replyText' }, { status: 400 });
    }

    await connectToDatabase();

    const rawPhone = phone.replace(/\D/g, '');
    const phoneSuffix = rawPhone.length > 9 ? rawPhone.slice(-9) : rawPhone;

    const vendors = await Vendor.find({ is_bot_active: true });
    const vendor = vendors.find((v: any) => v.whatsapp_number.replace(/\D/g, '').endsWith(phoneSuffix));

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found or bot inactive' }, { status: 404 });
    }

    const order = await Order.findOne({
      status: 'NEGOTIATING',
      'allocations.vendor_id': vendor._id,
      'allocations.status': 'NEGOTIATING'
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'No active negotiating order for this vendor' }, { status: 404 });
    }

    await processVendorReply(order._id.toString(), vendor._id.toString(), replyText);

    return NextResponse.json({ success: true, message: 'Reply processed' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
