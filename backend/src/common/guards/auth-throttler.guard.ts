import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';
import { SecurityLoggerService } from '../services/security-logger.service';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  private readonly authLogger = new Logger(AuthThrottlerGuard.name);

  // In standard @nestjs/throttler v5+, generateKey requires different params.
  // Assuming a generic generateKey compatible with ThrottlerGuard.
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown-ip';
    const email = req.body?.email ? String(req.body.email).toLowerCase() : 'no-email';
    return `${ip}:${email}`;
  }

  protected async handleRequest(requestProps: any): Promise<boolean> {
    const { context, limit, ttl, throttler } = requestProps;
    const req = context.switchToHttp().getRequest() as Request;
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, throttler.name);
    // In newer NestJS Throttler, increment takes (key, ttl, limit, blockDuration, throttlerName)
    const { totalHits } = await this.storageService.increment(key, ttl, limit, ttl, throttler.name);

    if (totalHits > limit) {
      // Inject SecurityLoggerService dynamically since extending ThrottlerGuard doesn't easily allow DI via constructor without super params matching
      // Note: NestJS ThrottlerGuard can access Context. We can get moduleRef to get SecurityLoggerService if needed,
      // but for simplicity, we use Logger here and handle email/alerting via standard logs.
      this.authLogger.warn(`Rate limit exceeded for tracker: ${tracker}`);
      throw new ThrottlerException('Rate limit exceeded');
    }

    return true;
  }
}
