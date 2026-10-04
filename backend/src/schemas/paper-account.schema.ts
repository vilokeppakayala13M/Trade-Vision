import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaperAccountDocument = HydratedDocument<PaperAccount>;

@Schema({ timestamps: true, collection: 'paper_accounts' })
export class PaperAccount extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: User;

  @Prop({ type: Number, default: 1000000 })
  balance: number;

  @Prop({ type: Number, default: 1000000 })
  startingBalance: number;

  @Prop({ type: String, default: 'INR' })
  currency: string;

  @Prop({ type: Date })
  lastResetAt?: Date;

  @Prop({ type: Number, default: 0 })
  version: number;
}

export const PaperAccountSchema = SchemaFactory.createForClass(PaperAccount);
