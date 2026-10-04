import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { rateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const limitRes = await rateLimit(`contact_${ip}`, 5, 60 * 60 * 1000);
        if (!limitRes.success) {
            return createRateLimitResponse(limitRes.reset);
        }

        const { name, email, subject, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ message: 'Name, email, and message are required.' }, { status: 400 });
        }

        const targetRecipient = process.env.CONTACT_EMAIL || 'supporttradevision@gmail.com';

        await sendEmail({
            from: email,
            to: targetRecipient,
            subject: `TradeVision Support: ${subject}`,
            text: `You have received a new support request from ${name} (${email}).\n\nSubject: ${subject}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>New Support Request: ${subject}</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr />
                    <h3>Message:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
        });

        return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ message: 'Failed to send email. Please try again later.' }, { status: 500 });
    }
}
