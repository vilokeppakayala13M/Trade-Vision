import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { encrypt, decrypt } from '../common/utils/encryption.util';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class UserPreferences {
  @Prop({ type: String, enum: ['dark', 'light', 'system'], default: 'dark' })
  theme: string;

  @Prop({ type: Boolean, default: true })
  emailNotifications: boolean;

  @Prop({ type: Boolean, default: false })
  pushNotifications: boolean;

  @Prop({ type: String, default: 'all' })
  defaultSector: string;

  @Prop({ type: String, enum: ['grid', 'list'], default: 'grid' })
  defaultWatchlistView: string;
}

@Schema({ _id: false })
class PushSubscriptionKeys {
  @Prop()
  p256dh: string;

  @Prop()
  auth: string;
}

@Schema({ _id: false })
class PushSubscription {
  @Prop()
  endpoint: string;

  @Prop({ type: PushSubscriptionKeys })
  keys: PushSubscriptionKeys;
}

@Schema({ _id: false })
class RefreshTokenFamily {
  @Prop({ required: true })
  familyId: string;

  @Prop({ required: true })
  tokenHash: string;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  issuedAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User extends Document {
  @Prop({ type: String, required: true, trim: true, minlength: 2, maxlength: 50 })
  name: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, sparse: true })
  phone?: string;

  @Prop({ type: String, select: false })
  phoneHash?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ type: Boolean, default: false })
  needsPasswordMigration?: boolean;

  @Prop({ type: Number, default: 0 })
  failedLoginAttempts: number;

  @Prop({ type: Date })
  lastFailedLoginAt?: Date;

  @Prop({ type: Date })
  lockedUntil?: Date;

  @Prop([{ type: RefreshTokenFamily }])
  refreshTokenFamily: RefreshTokenFamily[];

  @Prop({ type: String, sparse: true })
  googleId?: string;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: String, select: false })
  emailVerificationToken?: string;

  @Prop({ type: Date })
  emailVerificationExpires?: Date;

  @Prop({ type: String, select: false })
  resetPasswordToken?: string;

  @Prop({ type: Date })
  resetPasswordExpires?: Date;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

  @Prop({ type: String, enum: ['free', 'pro'], default: 'free' })
  tier: string;

  @Prop({ type: Date })
  proExpiresAt?: Date;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Number, default: 0 })
  loginCount: number;

  @Prop({ type: Date, sparse: true })
  deletionScheduledAt?: Date;

  @Prop({ type: UserPreferences, default: () => ({}) })
  preferences: UserPreferences;

  @Prop([{ type: String }])
  watchlist: string[];

  @Prop({ type: PushSubscription })
  pushSubscription?: PushSubscription;

  decryptedPhone?: string;

  comparePassword: (candidate: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('decryptedPhone').get(function () {
  return this.phone ? decrypt(this.phone) : undefined;
});

UserSchema.pre<UserDocument>('save', async function (next: any) {
  // Encrypt phone
  if (this.isModified('phone') && this.phone) {
    const rawPhone = this.phone;
    this.phone = encrypt(rawPhone);
    const hmacSecret = process.env.PHONE_HMAC_SECRET || 'fallback_hmac_secret';
    this.phoneHash = crypto.createHmac('sha256', hmacSecret).update(rawPhone).digest('hex');
  }

  // Hash password
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  
  if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
    try {
      return await bcrypt.compare(candidate, this.password);
    } catch {
      return false;
    }
  }
  
  try {
    return await argon2.verify(this.password, candidate);
  } catch {
    return false;
  }
};
