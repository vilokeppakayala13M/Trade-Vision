import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  generateCsrfToken(userId: string): string {
    const secret = process.env.CSRF_SECRET || 'fallback-dev-secret-change-in-prod';
    const timestamp = Date.now().toString(36);
    const hash = crypto.createHmac('sha256', secret).update(userId + ':' + timestamp).digest('hex');
    return `${hash}.${timestamp}`;
  }

  verifyCsrfToken(token: string, userId: string): boolean {
    if (!token || !userId) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [hash, timestamp] = parts;
    const secret = process.env.CSRF_SECRET || 'fallback-dev-secret-change-in-prod';
    
    // Check if timestamp is within 24 hours
    const tokenTime = parseInt(timestamp, 36);
    if (Date.now() - tokenTime > 86400000) {
      return false; // expired
    }

    const expectedHash = crypto.createHmac('sha256', secret).update(userId + ':' + timestamp).digest('hex');
    
    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
    } catch {
      return false;
    }
  }
}
