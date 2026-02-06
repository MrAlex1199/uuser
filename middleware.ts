import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const pathname = req.nextUrl.pathname;

  // If user is on login or register page
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch (error) {
        // Token is invalid, allow access to login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // For protected routes (dashboard, members, warranty, expired)
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/members/:path*', '/warranty/:path*', '/expired/:path*', '/login', '/register'],
};
