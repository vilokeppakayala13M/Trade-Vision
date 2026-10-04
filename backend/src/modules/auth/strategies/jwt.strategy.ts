import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { RevokedToken, RevokedTokenDocument } from '../../../schemas/revoked-token.schema';
import { hashToken } from '../../../common/utils/format.util';
import { AuthContext } from '../../../common/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectModel(RevokedToken.name) private revokedTokenModel: Model<RevokedTokenDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') as string,
      algorithms: ['HS256'],
      issuer: 'tradevision',
      audience: 'tradevision-client',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<AuthContext> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Token is missing' });
    }

    const hashedToken = hashToken(token);
    const isRevoked = await this.revokedTokenModel.exists({ token: hashedToken });
    if (isRevoked) {
      throw new UnauthorizedException({ code: 'TOKEN_REVOKED', message: 'Token has been revoked' });
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      tier: payload.tier,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}

