import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import { Restaurant } from '@/models/Restaurant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact_person, email, phone, password, location } = body;

    if (!name || !contact_person || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const restaurant = await Restaurant.create({
      name,
      contact_person,
      email,
      phone,
      password: hashedPassword,
    });

    return NextResponse.json({ 
      success: true, 
      data: { _id: restaurant._id, email: restaurant.email } 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
