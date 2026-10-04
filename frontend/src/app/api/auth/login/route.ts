import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';
import { toClientError } from '@/lib/errors';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        // 10 attempts per 15 minutes per IP as requested
        const limitRes = await rateLimit(`login_${ip}`, 10, 15 * 60 * 1000); 
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        await dbConnect();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const safeRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        // Must explicitly select password because it's set to select: false in the schema
        const user = await User.findOne({ email: { $regex: safeRegex } }).select('+password');

        if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.password && user.googleId) {
            return NextResponse.json({ success: false, error: 'Please login using Google OAuth.' }, { status: 401 });
        }

        let isMatch = false;
        let needsMigration = false;

        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
            needsMigration = isMatch;
        } else {
            try {
                isMatch = await argon2.verify(user.password, password);
            } catch {
                isMatch = false;
            }
        }

        if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        if (needsMigration) {
            const newHash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 4,
            });
            user.password = newHash;
            await user.save();
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
        const clientErr = toClientError(error);
        return NextResponse.json({ success: false, error: clientErr.error }, { status: clientErr.statusCode });
    }
}
