import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const vendors = await Vendor.find({}).sort({ fulfillment_score: -1 });
    return NextResponse.json({ success: true, data: vendors }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, whatsapp_number, commodities, address, detailed_address } = body;

    if (!name || !whatsapp_number || !address) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const cleanedNumber = whatsapp_number.replace(/\D/g, '');
    const mockRestaurantId = "6a5b972d2668d5fa87b17553";

    let latitude = undefined;
    let longitude = undefined;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
        headers: { 'User-Agent': 'AgroProcurementApp/1.0' }
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      }
    } catch (err) {
    }

    await connectToDatabase();
    
    let vendor = await Vendor.findOne({ whatsapp_number: cleanedNumber });

    if (vendor) {
      if (!vendor.associated_restaurants.includes(mockRestaurantId)) {
        vendor.associated_restaurants.push(mockRestaurantId);
      }
      vendor.address = address;
      if (detailed_address !== undefined) {
        vendor.detailed_address = detailed_address;
      }
      if (latitude !== undefined && longitude !== undefined) {
        vendor.location = { latitude, longitude };
      }
      await vendor.save();
    } else {
      const locationObj = (latitude !== undefined && longitude !== undefined) ? { latitude, longitude } : undefined;
      vendor = await Vendor.create({
        name,
        whatsapp_number: cleanedNumber,
        commodities: commodities || [],
        associated_restaurants: [mockRestaurantId],
        address,
        detailed_address: detailed_address || "",
        location: locationObj
      });
    }

    return NextResponse.json({ success: true, data: vendor }, { status: 201 });
  } catch (error: any) {
    console.error('Vendor Create Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
