import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaperLeaderboardDocument = HydratedDocument<PaperLeaderboard>;

@Schema({ _id: false })
class BestTrade {
  @Prop()
  symbol: string;

  @Prop()
  returnPercent: number;
}

@Schema({ timestamps: true })
export class PaperLeaderboard extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: User;

  @Prop({ type: String, required: true })
  displayName: string;

  @Prop({ type: Number, required: true })
  totalReturn: number;

  @Prop({ type: Number, required: true })
  totalReturnAbsolute: number;

  @Prop({ type: Number, required: true })
  currentPortfolioValue: number;

  @Prop({ type: Number, required: true })
  tradeCount: number;

  @Prop({ type: Number, required: true })
  winRate: number;

  @Prop({ type: BestTrade })
  bestTrade?: BestTrade;

  @Prop({ type: Number })
  rank?: number;

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

export const PaperLeaderboardSchema = SchemaFactory.createForClass(PaperLeaderboard);
