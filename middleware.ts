import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_only' });
  
  const pathname = req.nextUrl.pathname;
  
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/vendors') || pathname.startsWith('/orders');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/orders', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/vendors/:path*', '/orders/:path*', '/login', '/register'],
};
