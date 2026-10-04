import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import * as argon2 from 'argon2';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        // 5 requests per 15 minutes per IP as requested
        const limitRes = await rateLimit(`reset_${ip}`, 5, 15 * 60 * 1000);
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        await dbConnect();
        const { token, email, newPassword } = await req.json();

        if (!token || !email || !newPassword) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

        const normalizedEmail = email.trim().toLowerCase();
        const safeRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        const user = await User.findOne({
            email: { $regex: safeRegex },
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 });
        }

        const hashedPassword = await argon2.hash(newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: 'Password has been reset successfully' }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
