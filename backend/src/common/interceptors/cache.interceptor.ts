import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
export { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return undefined;
    }

    const userId = user?.userId || 'anon';
    return `tv:${method}:${url}:${userId}`;
  }
}
