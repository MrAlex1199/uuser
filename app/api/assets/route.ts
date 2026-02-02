import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Asset from '@/models/Asset';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const assets = await Asset.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const asset = new Asset(body);
    await asset.save();

    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error creating asset';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
