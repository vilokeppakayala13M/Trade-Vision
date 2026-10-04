import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        // Enforce JWT Bearer token authentication
        const decoded = requireAuth(req) as any;

        await dbConnect();
        
        // Fetch the current user, ensuring we don't expose sensitive info
        const user = await User.findById(decoded.id).select('-emailVerificationToken -resetPasswordToken -password');

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: user
        }, { status: 200 });

    } catch (error: any) {
        if (error.message.startsWith('Unauthorized')) {
            return NextResponse.json({ success: false, error: error.message }, { status: 401 });
        }
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
