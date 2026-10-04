import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CsrfService } from '../../modules/auth/csrf.service';
import { IS_PUBLIC_KEY } from '../decorators/current-user.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly csrfService: CsrfService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const csrfCookie = request.cookies?.['csrfToken'];
    const csrfHeader = request.headers['x-csrf-token'] as string;

    if (!csrfCookie || !csrfHeader) {
      throw new ForbiddenException({ code: 'CSRF_TOKEN_INVALID', message: 'Invalid or missing CSRF token' });
    }

    if (csrfCookie !== csrfHeader) {
      throw new ForbiddenException({ code: 'CSRF_TOKEN_INVALID', message: 'CSRF token mismatch' });
    }

    const userId = (request as any).user?.userId;
    if (!userId) {
       // if user is not set yet, we might be in an auth route before JWT guard. 
       // If it's not public and no userId, JWT guard should have blocked it first if Guards are ordered correctly.
       throw new ForbiddenException({ code: 'CSRF_TOKEN_INVALID', message: 'User context missing for CSRF validation' });
    }

    const isValid = this.csrfService.verifyCsrfToken(csrfHeader, userId);
    if (!isValid) {
      throw new ForbiddenException({ code: 'CSRF_TOKEN_INVALID', message: 'Invalid CSRF token signature or expired' });
    }

    return true;
  }
}
