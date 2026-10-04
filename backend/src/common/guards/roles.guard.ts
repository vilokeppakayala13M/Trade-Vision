import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.tier) {
      return false;
    }

    const hasRole = requiredRoles.includes(user.tier);
    if (!hasRole) {
      throw new ForbiddenException({
        code: 'FEATURE_LOCKED',
        requiredTier: requiredRoles[0],
        message: 'Upgrade to Pro to access this feature',
      });
    }
    return true;
  }
}
