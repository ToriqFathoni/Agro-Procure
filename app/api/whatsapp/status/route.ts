import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: (global as any)._whatsappStatus || 'DISCONNECTED', 
      qr: (global as any)._whatsappQrData || null 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
