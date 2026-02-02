import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Member from '@/models/Member';

interface ParamsPromise {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ParamsPromise> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const member = await Member.findById(id);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching member' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<ParamsPromise> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const member = await Member.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error updating member';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<ParamsPromise> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error deleting member' }, { status: 500 });
  }
}
