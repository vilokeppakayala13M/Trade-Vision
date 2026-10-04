import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type AccountLedgerDocument = HydratedDocument<AccountLedger>;

@Schema({ timestamps: true, collection: 'account_ledger' })
export class AccountLedger extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PaperOrder' })
  orderId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: ['trade', 'reset', 'adjustment'], required: true })
  type: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  balanceAfter: number;

  @Prop({ type: String })
  description?: string;
}

export const AccountLedgerSchema = SchemaFactory.createForClass(AccountLedger);
AccountLedgerSchema.index({ userId: 1, createdAt: -1 });
