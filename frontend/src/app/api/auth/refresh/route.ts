import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const limitRes = await rateLimit(ip, 20, 15 * 60 * 1000);
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        const refreshToken = req.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ success: false, error: 'No refresh token provided' }, { status: 401 });
        }

        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
        let decoded: any;
        
        try {
            decoded = jwt.verify(refreshToken, refreshTokenSecret);
        } catch (err) {
            return NextResponse.json({ success: false, error: 'Invalid or expired refresh token' }, { status: 403 });
        }

        await dbConnect();
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            jwtSecret,
            { expiresIn: '15m' }
        );

        return NextResponse.json({
            success: true,
            data: {
                accessToken,
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        }, { status: 200 });

    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
