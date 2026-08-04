import { NextRequest, NextResponse } from 'next/server';
import { parseVendorReply } from '@/services/gemini';

export async function GET(request: NextRequest) {
  try {
    const message = request.nextUrl.searchParams.get('message');

    if (!message) {
      return NextResponse.json({ error: 'Message parameter is required' }, { status: 400 });
    }

    const parsedData = await parseVendorReply(message);
    
    return NextResponse.json({ success: true, data: parsedData }, { status: 200 });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
