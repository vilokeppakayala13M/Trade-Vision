import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const limitRes = await rateLimit(`forgot_${ip}`, 10, 60 * 60 * 1000); 
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        await dbConnect();
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const safeRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        const user = await User.findOne({ email: { $regex: safeRegex } });

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: `No registered account found for ${email}. Please check the email address or register.` 
            }, { status: 404 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        const mailRes = await sendEmail({
            to: user.email,
            subject: 'TradeVision Password Reset Request',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.name || 'Trader'},</p>
                    <p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; margin-top: 10px; margin-bottom: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p style="font-size: 0.9em; color: #666;">Or copy this link: <br/>${resetUrl}</p>
                    <p style="font-size: 0.9em; color: #666;">If you did not request this, please ignore this email.</p>
                </div>
            `,
        });

        if (mailRes.isFallback) {
            return NextResponse.json({ 
                success: true, 
                message: `Password reset link generated successfully! (SMTP App Password not set in .env.local yet)`, 
                resetUrl 
            }, { status: 200 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Password reset link sent to ${user.email}. Please check your email inbox.`,
            resetUrl
        }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }, { status: 500 });
    }
}
