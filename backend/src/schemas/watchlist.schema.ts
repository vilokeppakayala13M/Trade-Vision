import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

export type WatchlistDocument = HydratedDocument<Watchlist>;

@Schema({ _id: false })
class WatchlistSymbol {
  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;

  @Prop({ type: String })
  notes?: string;
}

@Schema({ timestamps: true })
export class Watchlist extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: User;

  @Prop({ type: [WatchlistSymbol], default: [] })
  symbols: WatchlistSymbol[];

  hasSymbol: (symbol: string) => boolean;
}

export const WatchlistSchema = SchemaFactory.createForClass(Watchlist);

WatchlistSchema.methods.hasSymbol = function (symbol: string): boolean {
  return this.symbols.some((s: WatchlistSymbol) => s.symbol === symbol);
};
