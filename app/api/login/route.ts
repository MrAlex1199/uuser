import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);
    console.log('Password from request:', password);


    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    console.log('User found in DB:', user);
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('Hashed password from DB:', user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', passwordMatch);
    if (!passwordMatch) {
      console.log('Password does not match');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login successful, creating token');
    const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
