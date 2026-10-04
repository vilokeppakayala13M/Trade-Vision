import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type AlertDocument = HydratedDocument<Alert>;

@Schema({ timestamps: true })
export class Alert extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String, required: true })
  displaySymbol: string;

  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: Number, required: true })
  targetPrice: number;

  @Prop({ type: String, enum: ['ABOVE', 'BELOW'], required: true })
  direction: string;

  @Prop([{ type: String, enum: ['push', 'email'] }])
  notifyVia: string[];

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  triggered: boolean;

  @Prop({ type: Date })
  triggeredAt?: Date;

  @Prop({ type: Number })
  triggeredPrice?: number;

  @Prop({ type: String })
  notes?: string;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

AlertSchema.index({ userId: 1, active: 1 });
AlertSchema.index({ symbol: 1, active: 1, triggered: 1 });
