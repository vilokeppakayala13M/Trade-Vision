import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaperOrderDocument = HydratedDocument<PaperOrder>;

@Schema({ timestamps: true, collection: 'orders' })
export class PaperOrder extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ type: String, required: true, uppercase: true })
  symbol: string;

  @Prop({ type: String })
  displaySymbol: string;

  @Prop({ type: String, enum: ['buy', 'sell', 'BUY', 'SELL'], required: true })
  side: string;

  @Prop({ type: String, enum: ['market', 'MARKET', 'limit', 'LIMIT'], default: 'market' })
  type: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number })
  requestedPrice?: number;

  @Prop({ type: Number, required: true })
  filledPrice: number;

  @Prop({ type: Number })
  totalValue: number;

  @Prop({ type: Number, default: 20 })
  brokerage: number;

  @Prop({ type: Number })
  netValue: number;

  @Prop({ type: String, enum: ['pending', 'filled', 'rejected', 'cancelled'], default: 'filled' })
  status: string;

  @Prop({ type: String })
  rejectionReason?: string;

  @Prop({ type: Date, default: Date.now })
  filledAt: Date;
}

export const PaperOrderSchema = SchemaFactory.createForClass(PaperOrder);
PaperOrderSchema.index({ userId: 1, createdAt: -1 });
PaperOrderSchema.index({ userId: 1, symbol: 1 });
