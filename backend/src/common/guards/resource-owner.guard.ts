import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { SecurityLoggerService } from '../services/security-logger.service';

export const RESOURCE_MODEL_KEY = 'resourceModel';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectConnection() private readonly connection: Connection,
    private readonly securityLogger: SecurityLoggerService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.userId;

    if (!userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You do not have permission to access this resource' });
    }

    const modelName = this.reflector.get<string>(RESOURCE_MODEL_KEY, context.getHandler());
    if (!modelName) {
      return true; // No model specified, skip check
    }

    const resourceId = request.params.id as string;
    if (!resourceId || !Types.ObjectId.isValid(resourceId)) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Resource not found or invalid ID' });
    }

    const model = this.connection.models[modelName];
    if (!model) {
      return true; 
    }

    const resource = await model.findById(resourceId).lean();
    if (!resource) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'Resource not found' });
    }

    if (resource.userId && resource.userId.toString() !== userId) {
      this.securityLogger.logUnauthorisedResourceAccess(userId, resourceId as string, modelName, request.path);
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You do not have permission to access this resource' });
    }

    (request as any).resource = resource;
    return true;
  }
}
