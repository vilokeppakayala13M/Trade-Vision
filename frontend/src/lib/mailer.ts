import nodemailer from 'nodemailer';

export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

export interface SendEmailResult {
    success: boolean;
    isFallback: boolean;
    error?: string;
}

export async function sendEmail({ to, subject, html, text, from }: SendEmailParams): Promise<SendEmailResult> {
    const sender = from || process.env.CONTACT_EMAIL || 'supporttradevision@gmail.com';
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER || 'supporttradevision@gmail.com';
    const pass = process.env.SMTP_PASS;

    const isSecure = port === 465;

    // Check if we have real SMTP password credentials configured
    const hasValidPass = Boolean(pass && pass.trim().length > 0 && pass !== 'dev_pass' && pass !== 'your_gmail_app_password');

    console.log(`\n================== [MAILER ATTEMPT] ==================`);
    console.log(`To: ${to}`);
    console.log(`From: ${sender}`);
    console.log(`SMTP Host: ${host}:${port} | User: ${user}`);
    console.log(`Has SMTP Password Configured: ${hasValidPass}`);

    if (!hasValidPass) {
        console.log(`[Mailer Info] No valid SMTP_PASS configured in .env.local.`);
        console.log(`[Mailer Fallback Output]:\n${html}`);
        console.log(`======================================================\n`);
        return { success: true, isFallback: true };
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass },
    });

    try {
        await transporter.sendMail({
            from: `TradeVision <${sender}>`,
            to,
            subject,
            text: text || html.replace(/<[^>]+>/g, ''),
            html,
        });
        console.log(`[Mailer Success] Real email delivered to ${to}`);
        console.log(`======================================================\n`);
        return { success: true, isFallback: false };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Mailer Error] Failed to send email to ${to}: ${errorMessage}`);
        console.log(`[Mailer Fallback Output]:\n${html}`);
        console.log(`======================================================\n`);

        return { success: false, isFallback: true, error: errorMessage };
    }
}
