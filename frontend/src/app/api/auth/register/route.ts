import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import * as argon2 from 'argon2';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        // 5 registrations per hour per IP as requested
        const limitRes = await rateLimit(`register_${ip}`, 5, 60 * 60 * 1000); 
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        await dbConnect();
        const { name, email, password, phone } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ success: false, error: 'Name, email, and password are required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const safeRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        const existingUser = await User.findOne({ email: { $regex: safeRegex } });
        if (existingUser) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });

        await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            emailVerified: true,
        });

        return NextResponse.json({ success: true, message: 'Registration successful. You can now login.' }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
