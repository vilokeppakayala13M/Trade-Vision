import { NextRequest, NextResponse } from 'next/server';
import { buildFeaturesDataset } from '@/lib/features';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Stock ID is required' }, { status: 400 });
    }

    const features = await buildFeaturesDataset(id);

    if (!features) {
        return NextResponse.json({ error: 'Failed to build features' }, { status: 500 });
    }

    return NextResponse.json(features);
}
