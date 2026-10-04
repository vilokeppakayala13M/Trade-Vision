import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_FIELDS = [
  'password',
  'resetPasswordToken',
  'emailVerificationToken',
  'refreshTokenFamily',
  'failedLoginAttempts',
  'lockedUntil',
  'pushSubscription'
];

@Injectable()
export class SanitiseResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.sanitise(data))
    );
  }

  private sanitise(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    
    // If it's an array, map over it
    if (Array.isArray(data)) {
      return data.map(item => this.sanitise(item));
    }
    
    // If it's an object with toJSON method (like mongoose document)
    if (typeof data.toJSON === 'function') {
      data = data.toJSON();
    }

    // If it's a plain object, recursively sanitise
    if (typeof data === 'object') {
      const result = { ...data };
      
      for (const key of Object.keys(result)) {
        if (SENSITIVE_FIELDS.includes(key)) {
          delete result[key];
        } else {
          result[key] = this.sanitise(result[key]);
        }
      }
      return result;
    }

    return data;
  }
}
