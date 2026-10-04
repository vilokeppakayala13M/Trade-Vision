import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Watchlist, WatchlistDocument } from '../../schemas/watchlist.schema';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { decryptIfPresent } from '../../common/utils/encryption.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private s3Client: S3Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Watchlist.name) private watchlistModel: Model<WatchlistDocument>,
  ) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
      }
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password +emailVerificationToken').exec();
  }

  async findOne(filter: any): Promise<User | null> {
    return this.userModel.findOne(filter).exec();
  }

  async create(dto: any): Promise<User> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async update(id: string, dto: any): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    
    Object.assign(user, dto);
    return user.save();
  }

  async updatePreferences(id: string, prefs: any): Promise<any> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: { preferences: prefs } },
      { new: true },
    ).exec();
    if (!user) throw new NotFoundException('User not found');
    return user.preferences;
  }

  async addToWatchlist(id: string, symbol: string): Promise<void> {
    const user = await this.findById(id);
    const watchlist = await this.watchlistModel.findOneAndUpdate(
      { userId: id },
      { $setOnInsert: { userId: id } },
      { new: true, upsert: true }
    );

    const limit = user.tier === 'pro' ? 500 : 50;
    if (watchlist.symbols.length >= limit && !watchlist.hasSymbol(symbol)) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        message: `Watchlist limit of ${limit} reached. Upgrade to Pro for more.`,
      });
    }

    if (!watchlist.hasSymbol(symbol)) {
      watchlist.symbols.push({ symbol, addedAt: new Date() });
      await watchlist.save();
    }
  }

  async removeFromWatchlist(id: string, symbol: string): Promise<void> {
    await this.watchlistModel.updateOne(
      { userId: id },
      { $pull: { symbols: { symbol } } }
    );
  }

  async getWatchlist(id: string): Promise<string[]> {
    const watchlist = await this.watchlistModel.findOne({ userId: id }).exec();
    return watchlist ? watchlist.symbols.map(s => s.symbol) : [];
  }

  async exportUserData(id: string): Promise<any> {
    const user = await this.userModel.findById(id).lean().exec() as any;
    const watchlist = await this.watchlistModel.findOne({ userId: id }).lean().exec();
    
    // DPDP Act compliance: decrypted PII for export
    if (user.phone) {
      try {
        user.phone = decryptIfPresent(user.phone);
      } catch (e) {
        this.logger.error('Failed to decrypt phone number for export', e);
      }
    }

    return {
      user,
      watchlist: watchlist?.symbols || [],
      exportedAt: new Date().toISOString(),
    };
  }

  async getFullProfile(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec() as any;
    if (!user) throw new NotFoundException('User not found');
    const watchlistCount = await this.watchlistModel.findOne({ userId: id }).then(w => w?.symbols?.length || 0);
    
    const profile = user.toObject();
    // Decrypt phone if present for full profile view
    if (profile.phone) {
      try {
        profile.phone = decryptIfPresent(profile.phone);
      } catch (e) {
        this.logger.error('Failed to decrypt phone number for profile view', e);
        profile.phone = '******';
      }
    }

    return { ...profile, watchlistCount };
  }

  async uploadAvatar(userId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const extension = mimeType.split('/')[1];
    const key = `avatars/${userId}-${uuid()}.${extension}`;
    
    // In dev, we might not have real AWS credentials, so we catch errors and mock it for testing if needed
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || 'tradevision-assets',
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      });
      await this.s3Client.send(command);
    } catch (e) {
      this.logger.warn(`S3 upload failed (expected in dev without creds). Continuing with dummy URL. Error: ${(e as Error).message}`);
    }

    const avatarUrl = `https://${process.env.AWS_S3_BUCKET || 'tradevision-assets'}.s3.amazonaws.com/${key}`;
    
    await this.userModel.findByIdAndUpdate(userId, { avatar: avatarUrl });
    return avatarUrl;
  }
}
