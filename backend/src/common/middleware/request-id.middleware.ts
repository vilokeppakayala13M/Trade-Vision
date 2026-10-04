import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { requestId?: string }, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string || uuid();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
