import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Restaurant } from '@/models/Restaurant';

const MOCK_ID = "6a5b972d2668d5fa87b17553";

export async function GET() {
  try {
    await connectToDatabase();
    let resto = await Restaurant.findById(MOCK_ID);
    if (!resto) {
      resto = await Restaurant.create({
        _id: MOCK_ID,
        name: "Default Restaurant",
        contact_person: "Admin",
        email: "admin@example.com",
        phone: "0000000000",
        password: "hashedpassword",
        addresses: []
      });
    }
    return NextResponse.json({ success: true, data: resto }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { label, full_address, detailed_address } = await req.json();
    if (!label || !full_address) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    let lat: number | null = null;
    let lon: number | null = null;
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(full_address)}`, {
        headers: { 'User-Agent': 'AgroProcurementApp/1.0' }
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lon = parseFloat(geoData[0].lon);
        }
      }
    } catch (err) {}
    
    let restaurant = await Restaurant.findById(MOCK_ID);

    if (!restaurant) {
      restaurant = new Restaurant({
        _id: MOCK_ID,
        name: "Mock Restaurant",
        contact_person: "Admin",
        email: "mock@restaurant.com",
        phone: "0000000000",
        password: "mock",
        addresses: []
      });
    }

    if (!restaurant.addresses) {
      restaurant.addresses = [];
    }

    const isFirstAddress = restaurant.addresses.length === 0;

    restaurant.addresses.push({
      label,
      full_address,
      detailed_address: detailed_address || "",
      location: { latitude: lat || 0, longitude: lon || 0 },
      is_default: isFirstAddress
    });

    await restaurant.save();

    return NextResponse.json({ success: true, data: restaurant }, { status: 200 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { address_id } = await req.json();
    if (!address_id) {
      return NextResponse.json({ success: false, error: 'Missing address_id' }, { status: 400 });
    }

    await connectToDatabase();
    
    const resto = await Restaurant.findById(MOCK_ID);
    if (!resto) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    resto.addresses = resto.addresses.map((addr: any) => {
      addr.is_default = addr._id.toString() === address_id;
      return addr;
    });

    await resto.save();

    return NextResponse.json({ success: true, data: resto }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { name, contact_person, email, phone } = await req.json();
    
    await connectToDatabase();
    
    const resto = await Restaurant.findById(MOCK_ID);
    if (!resto) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (name) resto.name = name;
    if (contact_person) resto.contact_person = contact_person;
    if (email) resto.email = email;
    if (phone) resto.phone = phone;

    await resto.save();

    return NextResponse.json({ success: true, data: resto }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
