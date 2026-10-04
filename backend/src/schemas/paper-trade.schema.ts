import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaperTradeDocument = HydratedDocument<PaperTrade>;

@Schema({ timestamps: true })
export class PaperTrade extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String, required: true })
  displaySymbol: string;

  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: String, enum: ['BUY', 'SELL'], required: true })
  action: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number })
  totalValue: number;

  @Prop({ type: Number, default: 20 })
  brokerage: number;

  @Prop({ type: Number })
  netValue: number;

  @Prop({ type: Date, default: Date.now })
  executedAt: Date;

  @Prop({ type: Number })
  realizedPnL?: number;
}

export const PaperTradeSchema = SchemaFactory.createForClass(PaperTrade);

PaperTradeSchema.index({ userId: 1, executedAt: -1 });
PaperTradeSchema.index({ userId: 1, symbol: 1 });

PaperTradeSchema.pre<PaperTradeDocument>('save', function (next: any) {
  this.totalValue = this.price * this.quantity;
  if (this.action === 'BUY') {
    this.netValue = this.totalValue + this.brokerage;
  } else {
    this.netValue = this.totalValue - this.brokerage;
  }
  next();
});

