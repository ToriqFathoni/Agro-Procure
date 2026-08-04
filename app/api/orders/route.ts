import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Vendor } from '@/models/Vendor';
import { Restaurant } from '@/models/Restaurant';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const orders = await Order.find({ restaurant_id: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { item_name, total_quantity, max_price_het, delivery_address, unit } = body;

    if (!item_name || !total_quantity || !max_price_het || !delivery_address) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let latitude = undefined;
    let longitude = undefined;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(delivery_address)}`, {
        headers: { 'User-Agent': 'AgroProcurementApp/1.0' }
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      }
    } catch (err) {}

    await connectToDatabase();

    const restaurant = await Restaurant.findById((session.user as any).id);
    const defaultRestoAddr = restaurant?.addresses?.find((a: any) => a.is_default);

    if (latitude === undefined || longitude === undefined) {
      if (defaultRestoAddr?.location?.latitude && defaultRestoAddr?.location?.longitude) {
        latitude = defaultRestoAddr.location.latitude;
        longitude = defaultRestoAddr.location.longitude;
      }
    }

    const searchItem = item_name.trim().toLowerCase();
    const activeVendors = await Vendor.find({ status: 'ACTIVE' });
    
    // Extract province from order address (usually the last part after comma)
    const orderAddrParts = delivery_address.split(',');
    const orderProvince = orderAddrParts.length > 1 ? orderAddrParts[orderAddrParts.length - 1].trim().toLowerCase() : '';

    let matchedVendors = activeVendors.filter(v => 
      v.commodities && v.commodities.some((c: string) => c.toLowerCase().includes(searchItem))
    ).map(v => {
      let dynamicScore = v.fulfillment_score;
      
      // Text-based Province Matching Penalty
      if (orderProvince && v.address) {
        const vendorAddrParts = v.address.split(',');
        const vendorProvince = vendorAddrParts.length > 1 ? vendorAddrParts[vendorAddrParts.length - 1].trim().toLowerCase() : '';
        if (vendorProvince && vendorProvince !== orderProvince) {
          // Completely different province/island -> Heavy Penalty
          dynamicScore -= 0.4;
        }
      }

      if (latitude !== undefined && longitude !== undefined && v.location?.latitude && v.location?.longitude) {
        // Distance penalty logic
        const toRad = (val: number) => val * (Math.PI / 180);
        const R = 6371;
        const dLat = toRad(v.location.latitude - latitude);
        const dLon = toRad(v.location.longitude - longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(latitude)) * Math.cos(toRad(v.location.latitude)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        const penalty = Math.min(dist * 0.001, 0.3); // max 30% additional penalty for raw distance
        dynamicScore -= penalty;
      }
      
      dynamicScore = parseFloat(Math.max(0.1, dynamicScore).toFixed(2));
      return { vendor: v, dynamicScore };
    });

    matchedVendors.sort((a, b) => b.dynamicScore - a.dynamicScore);

    const allocations = [];
    if (matchedVendors.length > 0) {
      allocations.push({
        vendor_id: matchedVendors[0].vendor._id,
        allocated_qty: Number(total_quantity),
        agreed_price: 0,
        status: 'PENDING' as const,
        fulfillment_score: matchedVendors[0].dynamicScore
      });
    }

    const order = await Order.create({
      restaurant_id: (session.user as any).id,
      item_name,
      total_quantity: Number(total_quantity),
      max_price_het: Number(max_price_het),
      status: 'DRAFT',
      allocations,
      delivery_address,
      delivery_location: (latitude !== undefined && longitude !== undefined) ? { latitude, longitude } : undefined,
      unit,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
