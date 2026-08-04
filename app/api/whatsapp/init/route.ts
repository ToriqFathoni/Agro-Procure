import { NextResponse } from 'next/server';
import { initializeClient } from '@/services/whatsapp';

export async function GET() {
  if (process.env.ENABLE_BOT !== 'true') {
    return NextResponse.json({ status: "success", message: "Bot disabled" });
  }

  try {
    initializeClient();
    return NextResponse.json({ status: "INITIALIZING" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }
}
