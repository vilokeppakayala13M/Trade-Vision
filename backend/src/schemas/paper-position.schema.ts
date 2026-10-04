import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaperPositionDocument = HydratedDocument<PaperPosition>;

@Schema({ timestamps: true, collection: 'positions' })
export class PaperPosition extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ type: String, required: true, uppercase: true })
  symbol: string;

  @Prop({ type: String })
  displaySymbol: string;

  @Prop({ type: String })
  companyName: string;

  @Prop({ type: String, default: 'long' })
  side: string;

  @Prop({ type: Number, required: true, min: 0 })
  quantity: number;

  @Prop({ type: Number, required: true })
  avgEntryPrice: number;

  @Prop({ type: Number, required: true })
  totalInvested: number;
}

export const PaperPositionSchema = SchemaFactory.createForClass(PaperPosition);
PaperPositionSchema.index({ userId: 1, symbol: 1 }, { unique: true });
