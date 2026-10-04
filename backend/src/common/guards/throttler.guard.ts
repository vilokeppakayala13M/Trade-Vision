import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.userId || req.ip;
  }

  protected throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: any): never {
    throw new ThrottlerException({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
      retryAfter: throttlerLimitDetail.timeToLive,
    } as any);
  }
}
