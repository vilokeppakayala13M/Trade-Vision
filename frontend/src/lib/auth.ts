import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function requireAuth(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized: Missing or invalid token format');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'fallback_secret_for_development'
        );
        return decoded;
    } catch (error) {
        throw new Error('Unauthorized: Invalid or expired token');
    }
}
