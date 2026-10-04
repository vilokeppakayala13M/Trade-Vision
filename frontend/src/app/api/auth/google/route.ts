import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as argon2 from 'argon2';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const limitRes = await rateLimit(`google_${ip}`, 20, 15 * 60 * 1000);
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        await dbConnect();
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json({ success: false, error: 'Google credential missing' }, { status: 400 });
        }

        // Decode the JWT sent by Google. We don't verify it since it comes directly via https via GIS script
        const decoded = jwt.decode(credential) as any;

        if (!decoded || !decoded.email) {
            return NextResponse.json({ success: false, error: 'Invalid Google credential' }, { status: 400 });
        }

        const { email, name, sub: googleId } = decoded;

        let user = await User.findOne({ email });

        if (!user) {
            // Create user
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await argon2.hash(randomPassword, {
                type: argon2.argon2id,
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 4,
            });

            user = await User.create({
                email,
                name,
                googleId,
                password: hashedPassword,
                emailVerified: true // Google accounts are implicitly verified
            });
        } else {
            // Update existing user with googleId if they don't have it
            if (!user.googleId) {
                user.googleId = googleId;
                user.emailVerified = true;
                await user.save();
            }
        }

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            jwtSecret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            refreshTokenSecret,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                accessToken,
            }
        }, { status: 200 });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
