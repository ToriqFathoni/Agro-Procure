import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Vendor } from '@/models/Vendor';

export async function POST(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const resolvedParams = await params;

    const order = await Order.findById(resolvedParams.orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'DRAFT') {
      return NextResponse.json({ success: false, error: 'Order is not in DRAFT state' }, { status: 400 });
    }

    order.status = 'NEGOTIATING';
    
    order.allocations.forEach((allocation: any) => {
      if (allocation.status === 'PENDING') {
        allocation.status = 'NEGOTIATING';
      }
    });

    await order.save();

    const vendorIds = order.allocations.map((a: any) => a.vendor_id);
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });

    for (let allocation of order.allocations) {
      if (allocation.status === 'NEGOTIATING') {
        const vendor = vendors.find((v: any) => v._id.toString() === allocation.vendor_id.toString());
        if (vendor) {
          let phone = vendor.whatsapp_number.replace(/\D/g, '');
          if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
          }
          if (!phone.endsWith('@c.us')) {
            phone += '@c.us';
          }

          const message = `Halo, kami dari Agro-Procurement. Kami membutuhkan pasokan ${order.item_name} sebanyak ${allocation.allocated_qty}. Apakah Anda dapat memenuhinya? Jika ya, mohon informasikan berapa harga per ${order.unit || 'Kg'} yang Anda tawarkan.`;

          try {
            const apiUrl = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3001';
            await fetch(`${apiUrl}/api/send-message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ number: phone, message })
            });
          } catch (e) {
            console.error('WA Send Error:', e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Negotiation started' }, { status: 200 });
  } catch (error: any) {
    console.error('Negotiate API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
