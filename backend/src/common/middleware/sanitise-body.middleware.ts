import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityLoggerService } from '../services/security-logger.service';

@Injectable()
export class SanitiseBodyMiddleware implements NestMiddleware {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitiseObject(req.body, req.ip || 'unknown', req.path);
    }
    if (req.query) {
      req.query = this.sanitiseObject(req.query, req.ip || 'unknown', req.path) as any;
    }
    next();
  }

  private sanitiseObject(obj: any, ip: string, path: string): any {
    if (obj === null || typeof obj !== 'object') {
      return this.sanitiseValue(obj, ip, path);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitiseObject(item, ip, path));
    }

    const sanitised: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // 1. Strip keys starting with $ or containing . (covered mostly by express-mongo-sanitize, but added here for completeness)
      if (key.startsWith('$') || key.includes('.')) {
        this.securityLogger.logNoSQLInjectionAttempt(ip, key, value, path);
        continue;
      }

      // 2. Check if value is an object attempting NoSQL injection syntax as a string
      if (typeof value === 'object' && value !== null) {
        const stringRep = JSON.stringify(value);
        if (/^\{.*\$.*\}/.test(stringRep)) {
          this.securityLogger.logNoSQLInjectionAttempt(ip, key, stringRep, path);
          sanitised[key] = '[BLOCKED]';
          continue;
        }
      }

      sanitised[key] = this.sanitiseObject(value, ip, path);
    }
    return sanitised;
  }

  private sanitiseValue(value: any, ip: string, path: string): any {
    if (typeof value === 'string') {
      // Strip null bytes
      let cleanStr = value.replace(/\x00/g, '');
      
      // Strip HTML tags
      cleanStr = cleanStr.replace(/<[^>]*>/g, '');
      
      // Limit to 10000 characters
      if (cleanStr.length > 10000) {
        cleanStr = cleanStr.substring(0, 10000);
      }
      
      return cleanStr;
    }
    return value;
  }
}
