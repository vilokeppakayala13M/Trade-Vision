import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type PaperPortfolioDocument = HydratedDocument<PaperPortfolio>;

@Schema({ _id: false })
export class Holding {
  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String, required: true })
  displaySymbol: string;

  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: Number, min: 1, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  avgBuyPrice: number;

  @Prop({ type: Number, required: true })
  totalInvested: number;

  @Prop({ type: Date, default: Date.now })
  firstBuyDate: Date;

  @Prop({ type: Date, default: Date.now })
  lastBuyDate: Date;
}
export const HoldingSchema = SchemaFactory.createForClass(Holding);

@Schema({ timestamps: true })
export class PaperPortfolio extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: User;

  @Prop({ type: Number, default: 1000000 })
  cashBalance: number;

  @Prop({ type: Number, default: 1000000 })
  startingBalance: number;

  @Prop({ type: Number, default: 1000000 })
  totalDeposited: number;

  @Prop({ type: Date })
  lastResetAt?: Date;

  @Prop({ type: [HoldingSchema], default: [] })
  holdings: Holding[];

  getHolding: (symbol: string) => Holding | undefined;
  computeWeightedAvg: (existingQty: number, existingAvg: number, newQty: number, newPrice: number) => number;
}

export const PaperPortfolioSchema = SchemaFactory.createForClass(PaperPortfolio);

PaperPortfolioSchema.methods.getHolding = function (symbol: string): Holding | undefined {
  return this.holdings.find((h: Holding) => h.symbol === symbol);
};

PaperPortfolioSchema.methods.computeWeightedAvg = function (
  existingQty: number,
  existingAvg: number,
  newQty: number,
  newPrice: number,
): number {
  return (existingQty * existingAvg + newQty * newPrice) / (existingQty + newQty);
};
