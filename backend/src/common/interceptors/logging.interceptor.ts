import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl, requestId, user } = request;
    const userId = user?.userId ? `[User: ${user.userId}] ` : '';

    this.logger.log(`→ ${method} ${originalUrl} ${userId}[ReqID: ${requestId}]`);
    const now = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - now;
        const statusCode = response.statusCode;
        const size = JSON.stringify(data)?.length || 0;

        if (duration > 2000) {
          this.logger.warn(`← ${method} ${originalUrl} ${statusCode} ${duration}ms - SLOW REQUEST`);
        } else {
          this.logger.log(`← ${method} ${originalUrl} ${statusCode} ${duration}ms [Size: ${size} bytes]`);
        }
      })
    );
  }
}
