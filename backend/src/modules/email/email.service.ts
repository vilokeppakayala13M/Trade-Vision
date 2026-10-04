import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get('smtp.host') || 'smtp.gmail.com';
    const port = this.configService.get('smtp.port') || 587;
    const user = this.configService.get('smtp.user') || 'supporttradevision@gmail.com';
    const pass = this.configService.get('smtp.pass');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass && pass !== 'dev_pass' ? { user, pass } : undefined,
    });
  }

  private buildEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #0a0a0f; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1a24; border-radius: 8px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #6366f1; font-size: 24px; font-weight: bold; }
          .content { color: #e2e8f0; line-height: 1.6; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 20px; }
          a { color: #6366f1; text-decoration: none; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white !important; border-radius: 6px; font-weight: 500; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TradeVision</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>Not SEBI-registered investment advice.</p>
            <p>&copy; ${new Date().getFullYear()} TradeVision. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async send(options: EmailOptions, retries = 3): Promise<void> {
    const from = this.configService.get('smtp.from') || 'supporttradevision@gmail.com';
    for (let i = 0; i < retries; i++) {
      try {
        await this.transporter.sendMail({
          from: `TradeVision <${from}>`,
          ...options,
        });
        return;
      } catch (error) {
        this.logger.error(`Failed to send email to ${options.to} (Attempt ${i + 1}/${retries})`, error);
        if (i === retries - 1) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isAuthError = errorMessage.includes('535') || errorMessage.includes('Authentication') || errorMessage.includes('Invalid login');
          if (process.env.NODE_ENV !== 'production' || isAuthError) {
            this.logger.warn(`[DEV MAIL FALLBACK] Logged email to console for ${options.to}:`);
            this.logger.log(`TO: ${options.to}\nSUBJECT: ${options.subject}\nHTML: ${options.html}`);
            return;
          }
          throw error;
        }
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i))); // exponential backoff
      }
    }
  }

  async sendVerification(to: string, name: string, token: string): Promise<void> {
    const url = `${this.configService.get('app_url')}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;
    const html = this.buildEmailTemplate(`
      <h2>Welcome, ${name}!</h2>
      <p>Please verify your email address to get started with TradeVision.</p>
      <a href="${url}" class="btn">Verify Email</a>
    `);
    await this.send({ to, subject: 'Verify your TradeVision account', html });
  }

  async sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    const url = `${this.configService.get('app_url')}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;
    const html = this.buildEmailTemplate(`
      <h2>Hello, ${name}</h2>
      <p>You requested to reset your password. Click the button below to proceed.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `);
    await this.send({ to, subject: 'Password Reset Request', html });
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    const html = this.buildEmailTemplate(`
      <h2>Welcome to TradeVision, ${name}!</h2>
      <p>Your account is fully set up. Start exploring market insights today.</p>
    `);
    await this.send({ to, subject: 'Welcome to TradeVision', html });
  }

  async sendAlertTriggered(to: string, name: string, alert: any, currentPrice: number): Promise<void> {
    const html = this.buildEmailTemplate(`
      <h2>Price Alert Triggered</h2>
      <p>Hello ${name},</p>
      <p>Your alert for <strong>${alert.displaySymbol} (${alert.companyName})</strong> has been triggered.</p>
      <p>The current price is ₹${currentPrice}, which crossed your target of ₹${alert.targetPrice} (${alert.direction}).</p>
      <a href="${this.configService.get('app_url')}/alerts" class="btn">View Alerts</a>
    `);
    await this.send({ to, subject: `Alert: ${alert.displaySymbol} crossed ₹${alert.targetPrice}`, html });
  }

  async sendAccountDeletion(to: string, name: string, deletionDate: Date): Promise<void> {
    const html = this.buildEmailTemplate(`
      <h2>Account Deletion Scheduled</h2>
      <p>Hello ${name},</p>
      <p>Your account deletion has been scheduled for ${deletionDate.toLocaleDateString()}.</p>
      <p>If you wish to cancel this, please log back in before that date.</p>
    `);
    await this.send({ to, subject: 'Account Deletion Notice', html });
  }

  async sendTradeConfirmation(to: string, name: string, trade: any): Promise<void> {
    const html = this.buildEmailTemplate(`
      <h2>Trade Execution Confirmation</h2>
      <p>Hello ${name},</p>
      <p>Your ${trade.action} order for ${trade.quantity} shares of ${trade.symbol} at ₹${trade.price} has been executed in your paper trading account.</p>
      <p>Net value: ₹${trade.netValue}</p>
    `);
    await this.send({ to, subject: 'Paper Trade Confirmation', html });
  }

  async sendContactFormAck(to: string, name: string, ticketId: string): Promise<void> {
    const html = this.buildEmailTemplate(`
      <h2>Support Ticket Received</h2>
      <p>Hello ${name},</p>
      <p>We've received your inquiry (Ticket: ${ticketId}). Our support team will respond shortly.</p>
    `);
    await this.send({ to, subject: 'Support Request Received', html });
  }
}
