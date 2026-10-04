import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/mailer';

export async function DELETE(req: NextRequest) {
    try {
        const refreshToken = req.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
        let decoded: any;
        
        try {
            decoded = jwt.verify(refreshToken, refreshTokenSecret);
        } catch (err) {
            return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 403 });
        }

        await dbConnect();
        const user = await User.findById(decoded.id);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        user.deletionRequestedAt = new Date();
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'TradeVision Account Deletion Request',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Account Deletion Requested</h2>
                    <p>We have received your request to delete your account. Your account is now scheduled for permanent deletion in 30 days (as per DPDP Act guidelines).</p>
                    <p>If you change your mind within this 30-day grace period, please contact support.</p>
                </div>
            `,
        });

        const response = NextResponse.json({ success: true, message: 'Account deletion requested successfully' }, { status: 200 });
        
        // Invalidate the cookie
        response.cookies.delete('refreshToken');
        
        return response;

    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
