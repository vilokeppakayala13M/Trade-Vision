import * as jwt from 'jsonwebtoken';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  tier: string;
  familyId?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      {
        algorithms: ['HS256'],
        issuer: 'tradevision',
        audience: 'tradevision-client',
      },
      (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            reject(new UnauthorizedException({
              code: 'TOKEN_EXPIRED',
              message: 'Session has expired',
              expiredAt: (err as jwt.TokenExpiredError).expiredAt
            }));
          } else if (err.name === 'JsonWebTokenError') {
            reject(new UnauthorizedException({
              code: 'INVALID_TOKEN',
              message: 'Invalid session token'
            }));
          } else if (err.name === 'NotBeforeError') {
            reject(new UnauthorizedException({
              code: 'TOKEN_NOT_ACTIVE',
              message: 'Token not yet active'
            }));
          } else {
            reject(new InternalServerErrorException({
              code: 'JWT_ERROR',
              message: 'Failed to verify token'
            }));
          }
        } else {
          resolve(decoded as JwtPayload);
        }
      }
    );
  });
}
