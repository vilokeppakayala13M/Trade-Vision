import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');
        const email = url.searchParams.get('email');

        if (!token || !email) {
            return NextResponse.json({ success: false, error: 'Invalid verification link' }, { status: 400 });
        }

        const hashedVerificationToken = crypto.createHash('sha256').update(token).digest('hex');

        await dbConnect();
        const user = await User.findOne({
            email,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'Token is invalid or has expired' }, { status: 400 });
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: 'Email verified successfully. You can now log in.' }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
