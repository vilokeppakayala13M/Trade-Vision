import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ status: 'Connected to MongoDB' }, { status: 200 });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            { error: 'Failed to connect to database' },
            { status: 500 }
        );
    }
}
