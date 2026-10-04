import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    // Attempt to retrieve the existing CSRF secret from cookies
    let csrfSecret = req.cookies.get('csrfSecret')?.value;

    // Generate a new high-entropy secret if not present
    if (!csrfSecret) {
        csrfSecret = crypto.randomBytes(32).toString('hex');
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';

    // Sign the secret with the JWT secret key using HMAC SHA-256
    const csrfToken = crypto
        .createHmac('sha256', jwtSecret)
        .update(csrfSecret)
        .digest('hex');

    const response = NextResponse.json({ csrfToken });

    // Set the secret in a secure, httpOnly, Lax cookie
    response.cookies.set('csrfSecret', csrfSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
}
export const dynamic = 'force-dynamic';
