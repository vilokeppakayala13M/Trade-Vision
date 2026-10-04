import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface SecurityEvent {
  timestamp: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userAgent?: string;
  requestId?: string;
  userId?: string;
  email?: string;
  details?: any;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger('SecurityLogger');

  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  private async logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Log to stdout (structured JSON format)
    console.log(JSON.stringify({ level: 'security', ...fullEvent }));

    // Send email alert for high/critical events
    if (fullEvent.severity === 'high' || fullEvent.severity === 'critical') {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await this.emailQueue.add('email', {
          type: 'security-alert',
          to: adminEmail,
          name: 'Admin',
          event: fullEvent,
        }).catch(err => this.logger.error('Failed to queue security alert email', err));
      }
    }
  }

  logLoginSuccess(userId: string, email: string, ip?: string, userAgent?: string) {
    this.logEvent({
      eventType: 'LOGIN_SUCCESS',
      severity: 'low',
      userId,
      email,
      ip,
      userAgent,
    });
  }

  logLoginFailure(email: string, ip?: string, userAgent?: string, reason?: string, attemptNumber?: number) {
    this.logEvent({
      eventType: 'LOGIN_FAILURE',
      severity: 'low',
      email,
      ip,
      userAgent,
      details: { reason, attemptNumber },
    });
  }

  logAccountLocked(userId: string, email: string, ip?: string, failedAttempts?: number) {
    this.logEvent({
      eventType: 'ACCOUNT_LOCKED',
      severity: 'high',
      userId,
      email,
      ip,
      details: { failedAttempts },
    });
  }

  logPasswordReset(userId: string, email: string, ip?: string) {
    this.logEvent({
      eventType: 'PASSWORD_RESET',
      severity: 'medium',
      userId,
      email,
      ip,
    });
  }

  logSuspiciousRequest(ip: string, path: string, method: string, reason: string, payload?: string) {
    this.logEvent({
      eventType: 'SUSPICIOUS_REQUEST',
      severity: 'high',
      ip,
      details: { path, method, reason, payload },
    });
  }

  logNoSQLInjectionAttempt(ip: string, field: string, value: any, path?: string) {
    this.logEvent({
      eventType: 'NOSQL_INJECTION_ATTEMPT',
      severity: 'critical',
      ip,
      details: { field, value, path },
    });
  }

  logRateLimitExceeded(ip: string, userId?: string, endpoint?: string, limit?: number) {
    this.logEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      severity: 'medium',
      ip,
      userId,
      details: { endpoint, limit },
    });
  }

  logUnauthorisedResourceAccess(userId: string, resourceId: string, resourceType: string, path?: string) {
    this.logEvent({
      eventType: 'UNAUTHORISED_RESOURCE_ACCESS',
      severity: 'high',
      userId,
      details: { resourceId, resourceType, path },
    });
  }

  logTokenReuseDetected(userId: string, familyId: string, ip?: string) {
    this.logEvent({
      eventType: 'TOKEN_REUSE_DETECTED',
      severity: 'critical',
      userId,
      ip,
      details: { familyId },
    });
  }

  logAdminAction(adminId: string, action: string, targetId?: string, details?: any) {
    this.logEvent({
      eventType: 'ADMIN_ACTION',
      severity: 'medium',
      userId: adminId,
      details: { action, targetId, ...details },
    });
  }

  logAccountDeletion(userId: string, email: string, requestedAt: Date) {
    this.logEvent({
      eventType: 'ACCOUNT_DELETED',
      severity: 'high',
      userId,
      email,
      details: { requestedAt },
    });
  }
}
