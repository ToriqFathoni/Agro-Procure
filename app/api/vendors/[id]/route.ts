import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const resolvedParams = await params;
    const vendorId = resolvedParams.id;

    const vendor = await Vendor.findByIdAndUpdate(vendorId, { status }, { new: true });
    
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: vendor }, { status: 200 });
  } catch (error: any) {
    console.error('Vendor Status Update Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
