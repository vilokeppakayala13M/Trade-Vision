import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type RevokedTokenDocument = HydratedDocument<RevokedToken>;

@Schema({ timestamps: true })
export class RevokedToken extends Document {
  @Prop({ type: String, required: true, unique: true })
  token: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: Date, default: Date.now })
  revokedAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);
RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
