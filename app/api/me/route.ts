import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value ?? req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    // Ensure that the payload contains the expected user information
    if (!payload.email || !payload.name || !payload.role) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Error in /api/me:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
