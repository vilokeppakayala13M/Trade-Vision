import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { SecurityLoggerService } from '../services/security-logger.service';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly securityLogger: SecurityLoggerService
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const isProd = process.env.NODE_ENV === 'production';

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message: string | any = 'An unexpected error occurred. Please try again later.';
    let fields: { field: string; message: string }[] | undefined;
    let expiredAt: string | undefined;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse() as any;
      if (typeof response === 'object') {
        code = response.code || 'HTTP_EXCEPTION';
        message = response.message || exception.message;
        fields = response.fields || response.errors;
      } else {
        message = response;
      }
    } else if (exception?.name === 'MongoServerError' && exception.code === 11000) {
      httpStatus = HttpStatus.CONFLICT;
      code = 'DUPLICATE_KEY';
      const match = exception.message.match(/index: (\w+)_1/);
      const fieldName = match ? match[1] : 'field';
      message = `${fieldName} already exists`;
    } else if (exception?.name === 'ValidationError') {
      httpStatus = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      fields = Object.keys(exception.errors).map(path => ({
        field: path,
        message: exception.errors[path].message
      }));
    } else if (exception?.name === 'JsonWebTokenError') {
      httpStatus = HttpStatus.UNAUTHORIZED;
      code = 'INVALID_TOKEN';
      message = 'Invalid token';
    } else if (exception?.name === 'TokenExpiredError') {
      httpStatus = HttpStatus.UNAUTHORIZED;
      code = 'TOKEN_EXPIRED';
      message = 'Token expired';
      expiredAt = exception.expiredAt;
    } else {
      if (!isProd) {
        message = exception?.message;
        stack = exception?.stack;
      }
      this.logger.error(exception?.message, exception?.stack, {
        requestId: (request as any).requestId,
        userId: (request as any).user?.userId,
        path: httpAdapter.getRequestUrl(request),
        method: request.method,
      });
    }

    const errorResponse: any = {
      success: false,
      error: {
        code,
        message,
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        requestId: (request as any).requestId,
      },
      data: null,
    };

    if (fields) errorResponse.error.fields = fields;
    if (expiredAt) errorResponse.error.expiredAt = expiredAt;
    if (stack) errorResponse.error.stack = stack;

    if (httpStatus >= 500) {
      Sentry.captureException(exception);
    }

    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
