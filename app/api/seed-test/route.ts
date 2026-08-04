import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';

export async function GET() {
  try {
    await connectToDatabase();
    const vendor = await Vendor.findOne({ name: 'Ibu Siti Rempah' });

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    if (!vendor.commodities.includes('bawang')) {
      vendor.commodities.push('bawang');
      await vendor.save();
    }

    return NextResponse.json({ success: true, message: 'Vendor updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
