import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Asset from '@/models/Asset';

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

    const asset = await Asset.findById(id);
    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error fetching asset' }, { status: 500 });
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

    const asset = await Asset.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error updating asset';
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

    const asset = await Asset.findByIdAndDelete(id);
    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error deleting asset' }, { status: 500 });
  }
}
