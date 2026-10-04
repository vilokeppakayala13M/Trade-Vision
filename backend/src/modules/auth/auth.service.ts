import { Injectable, ConflictException, UnauthorizedException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto';
import { UserDocument } from '../../schemas/user.schema';
import { SecurityLoggerService } from '../../common/services/security-logger.service';
import { constantTimeEqual, addJitter } from '../../common/utils/constant-time.util';
import { verifyToken } from '../../common/utils/jwt.util';
import { RevokedToken, RevokedTokenDocument } from '../../schemas/revoked-token.schema';
import { hashToken } from '../../common/utils/format.util';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
    private securityLogger: SecurityLoggerService,
    @InjectModel(RevokedToken.name) private revokedTokenModel: Model<RevokedTokenDocument>,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: any; tokens: TokenPair }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await this.usersService.create({
      ...dto,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }) as UserDocument;

    await this.emailQueue.add('email', {
      type: 'verification',
      to: user.email,
      name: user.name,
      token: rawToken,
    });

    const tokens = await this.generateTokenPair(user);
    const safeUser = user.toObject() as any;
    delete safeUser.password;
    delete safeUser.phoneHash;
    delete safeUser.refreshTokenFamily;
    return { user: safeUser, tokens };
  }

  async validateUser(email: string, pass: string, ip?: string, userAgent?: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmailWithPassword(email) as UserDocument;
    if (!user) {
      await addJitter(300, 50);
      return null;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      this.securityLogger.logAccountLocked(user._id.toString(), email, ip, user.failedLoginAttempts);
      throw new UnauthorizedException({
        code: 'ACCOUNT_LOCKED',
        message: 'Account locked due to too many failed attempts. Check your email to unlock.',
        lockedUntil: user.lockedUntil,
        retryAfter: Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000)
      });
    }

    const isMatch = await user.comparePassword(pass);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLoginAt = new Date();

      if (user.failedLoginAttempts >= 10) {
        user.lockedUntil = new Date(Date.now() + 3600000); // 1 hour
        await this.emailQueue.add('email', {
          type: 'account-locked',
          to: user.email,
          name: user.name,
        });
      }

      await user.save();

      // Progressive delay: 1000 * 2^(attempts-1), max 30s
      const delayMs = Math.min(1000 * Math.pow(2, user.failedLoginAttempts - 1), 30000);
      await new Promise(r => setTimeout(r, delayMs));
      
      this.securityLogger.logLoginFailure(email, ip, userAgent, 'Invalid credentials', user.failedLoginAttempts);
      return null;
    }

    if (!user.emailVerified) {
      throw new ForbiddenException({ code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email' });
    }

    if ((user.password && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'))) || user.needsPasswordMigration) {
      user.password = pass; // pre-save hook will hash it with Argon2
      user.needsPasswordMigration = false;
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    
    await user.save();
    return user;
  }

  async login(user: UserDocument, ip?: string, userAgent?: string): Promise<{ user: any; tokens: TokenPair }> {
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    
    const tokens = await this.generateTokenPair(user);
    
    const safeUser = user.toObject() as any;
    delete safeUser.password;
    delete safeUser.phoneHash;
    delete safeUser.refreshTokenFamily;
    
    this.securityLogger.logLoginSuccess(user._id.toString(), user.email, ip, userAgent);
    return { user: safeUser, tokens };
  }

  async generateTokenPair(user: UserDocument, existingFamilyId?: string): Promise<TokenPair> {
    const userId = user._id.toString();
    const payload = { userId, email: user.email, name: user.name, tier: user.tier };
    
    const accessToken = jwt.sign(
      payload, 
      this.configService.get('jwt.secret') as string, 
      { 
        algorithm: 'HS256', 
        issuer: 'tradevision', 
        audience: 'tradevision-client', 
        subject: userId,
        expiresIn: this.configService.get('jwt.accessExpiresIn') || '15m'
      }
    );

    const familyId = existingFamilyId || crypto.randomUUID();
    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const refreshTokenPayload = { userId, familyId };
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      this.configService.get('jwt.refreshSecret') as string,
      {
        algorithm: 'HS256',
        issuer: 'tradevision',
        audience: 'tradevision-client',
        subject: userId,
        expiresIn: this.configService.get('jwt.refreshExpiresIn') || '7d'
      }
    );

    user.refreshTokenFamily = user.refreshTokenFamily || [];
    user.refreshTokenFamily.push({
      familyId,
      tokenHash,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    user.refreshTokenFamily = user.refreshTokenFamily.filter(f => f.expiresAt.getTime() > Date.now());
    await user.save();

    return { accessToken, refreshToken };
  }

  async refreshTokens(rawRefreshToken: string, ip?: string): Promise<TokenPair> {
    const payload = await verifyToken(rawRefreshToken, this.configService.get('jwt.refreshSecret') as string);
    const userId = payload.userId;
    const familyId = payload.familyId;

    if (!familyId) {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid refresh token payload' });
    }

    const user = await this.usersService.findById(userId) as UserDocument;
    if (!user) {
      throw new UnauthorizedException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    
    const families = user.refreshTokenFamily || [];
    const familyEntries = families.filter(f => f.familyId === familyId);
    const matchingEntry = familyEntries.find(f => constantTimeEqual(f.tokenHash, tokenHash));

    if (familyEntries.length > 0 && matchingEntry) {
      if (matchingEntry.usedAt) {
        user.refreshTokenFamily = user.refreshTokenFamily.filter(f => f.familyId !== familyId);
        await user.save();
        
        await this.emailQueue.add('email', {
          type: 'security-alert',
          to: user.email,
          name: user.name,
          event: 'Suspicious login detected'
        });
        
        this.securityLogger.logTokenReuseDetected(userId, familyId, ip);
        throw new UnauthorizedException({ code: 'TOKEN_REUSE_DETECTED', message: 'Suspicious activity detected. All sessions have been terminated for your security.' });
      }

      matchingEntry.usedAt = new Date();
      await user.save();
      
      return await this.generateTokenPair(user, familyId);
    }

    throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Invalid refresh token' });
  }

  async logout(rawRefreshToken: string, accessToken: string | undefined, userId: string): Promise<void> {
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
        if (decoded && decoded.exp) {
          const hashedToken = hashToken(accessToken);
          const exists = await this.revokedTokenModel.exists({ token: hashedToken });
          if (!exists) {
            await this.revokedTokenModel.create({
              token: hashedToken,
              userId: userId as any,
              expiresAt: new Date(decoded.exp * 1000),
            });
          }
        }
      } catch (err) {
        this.logger.error('Failed to revoke access token on logout', err);
      }
    }

    if (rawRefreshToken) {
      try {
        const payload = await verifyToken(rawRefreshToken, this.configService.get('jwt.refreshSecret') as string);
        const user = await this.usersService.findById(userId) as UserDocument;
        if (user && payload.familyId) {
          user.refreshTokenFamily = user.refreshTokenFamily.filter(f => f.familyId !== payload.familyId);
          await user.save();
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  async verifyEmail(token: string, email: string): Promise<void> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      await addJitter(300, 50);
      throw new BadRequestException('Invalid request');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    if (user.emailVerificationToken !== hashedToken || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email) as UserDocument;
    
    if (!user) {
      await argon2.hash('dummy-string-to-equalise-timing-' + email, { type: argon2.argon2id });
      await new Promise(r => setTimeout(r, 300));
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); 
    await user.save();

    const appUrl = this.configService.get('app_url');
    await this.emailQueue.add('email', {
      type: 'password-reset',
      to: user.email,
      name: user.name,
      link: `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`,
    });

    await new Promise(r => setTimeout(r, 300));
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  async resetPassword(rawToken: string, email: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    const user = await this.usersService.findOne({ 
      email, 
      resetPasswordToken: hashedToken, 
      resetPasswordExpires: { $gt: new Date() } 
    }) as UserDocument;

    if (!user) throw new BadRequestException({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = new Date();
    user.refreshTokenFamily = [];
    
    await user.save();

    this.securityLogger.logPasswordReset(user._id.toString(), user.email);

    await this.emailQueue.add('email', {
      type: 'welcome',
      to: user.email,
      name: user.name,
    });
  }

  async findOrCreateGoogleUser(profile: any): Promise<UserDocument> {
    const email = profile.emails[0].value;
    let user = await this.usersService.findByEmail(email) as UserDocument;
    
    if (user) {
      if (!user.emailVerified) {
        throw new ConflictException({
          code: 'EMAIL_UNVERIFIED_LINK',
          message: 'An unverified account with this email already exists. Please verify your email first before logging in with Google.'
        });
      }
      if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      return user;
    }

    user = await this.usersService.create({
      name: profile.displayName,
      email,
      googleId: profile.id,
      emailVerified: true,
      tier: 'free',
    }) as UserDocument;
    return user;
  }

  async rotateExpiredAccounts(): Promise<void> {
    // Basic implementation for scheduler
  }
}
