import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { orderId, vendorId } = resolvedParams;

    const formData = await request.formData();
    const status = formData.get('status') as string;
    const file = formData.get('file') as File | null;

    if (!status || !['COMPLETED', 'DELIVERED', 'QC_FAILED', 'ACCEPTED'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const allocationIndex = order.allocations.findIndex(
      (a: any) => a.vendor_id.toString() === vendorId
    );

    if (allocationIndex === -1) {
      return NextResponse.json({ success: false, error: 'Allocation not found' }, { status: 404 });
    }

    let secureUrl = undefined;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      secureUrl = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: status === 'ACCEPTED' ? 'pasok-dp' : 'pasok-qc' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url as string);
          }
        ).end(buffer);
      });
    }

    order.allocations[allocationIndex].status = status as any;
    if (secureUrl) {
      if (status === 'ACCEPTED') {
        order.allocations[allocationIndex].dp_receipt_url = secureUrl;
      } else {
        order.allocations[allocationIndex].proof_image_url = secureUrl;
      }
    }

    await order.save();

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    console.error('Update Allocation Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
