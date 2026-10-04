import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ 
        success: true, 
        message: 'Email verification is no longer required for accounts.' 
    }, { status: 200 });
}
