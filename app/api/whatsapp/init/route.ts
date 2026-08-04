import { NextResponse } from 'next/server';
import { initializeClient } from '@/services/whatsapp';

export async function GET() {
  try {
    initializeClient();
    return NextResponse.json({ status: "INITIALIZING" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }
}
