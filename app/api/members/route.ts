import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Member from '@/models/Member';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const members = await Member.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const member = new Member(body);
    await member.save();

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error creating member';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
