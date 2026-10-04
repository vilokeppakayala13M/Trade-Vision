import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IPaperTrade extends Document {
    userId: mongoose.Types.ObjectId;
    tradeId: string;
    symbol: string;
    displaySymbol: string;
    companyName: string;
    action: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    totalValue: number;
    brokerage: number;
    netValue: number;
    cashBalanceBefore: number;
    cashBalanceAfter: number;
    holdingQuantityBefore: number;
    holdingQuantityAfter: number;
    avgBuyPriceAfter: number;
    realizedPnL: number;
    realizedPnLPercent?: number;
    notes?: string;
    executedAt: Date;
    marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN';
}

const PaperTradeSchema = new Schema<IPaperTrade>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tradeId: { type: String, default: () => uuidv4(), unique: true },
    symbol: { type: String, required: true },
    displaySymbol: { type: String, required: true },
    companyName: { type: String, required: true },
    action: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    brokerage: { type: Number, required: true },
    netValue: { type: Number, required: true },
    cashBalanceBefore: { type: Number, required: true },
    cashBalanceAfter: { type: Number, required: true },
    holdingQuantityBefore: { type: Number, required: true },
    holdingQuantityAfter: { type: Number, required: true },
    avgBuyPriceAfter: { type: Number, required: true },
    realizedPnL: { type: Number, default: 0 },
    realizedPnLPercent: { type: Number },
    notes: { type: String, maxlength: 500 },
    executedAt: { type: Date, default: Date.now },
    marketStatus: { type: String, enum: ['OPEN', 'CLOSED', 'PRE_OPEN'], default: 'CLOSED' }
});

PaperTradeSchema.index({ userId: 1, executedAt: -1 });
PaperTradeSchema.index({ userId: 1, symbol: 1 });

export default mongoose.models.PaperTrade || mongoose.model<IPaperTrade>('PaperTrade', PaperTradeSchema);
