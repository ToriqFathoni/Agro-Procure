import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';

export async function PATCH(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const vendorId = resolvedParams.id;

    await connectToDatabase();
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    vendor.is_bot_active = !vendor.is_bot_active;
    await vendor.save();

    return NextResponse.json({ success: true, data: vendor }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
