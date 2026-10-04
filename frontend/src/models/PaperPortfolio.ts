import mongoose, { Schema, Document } from 'mongoose';

export interface IHolding {
    symbol: string;
    displaySymbol: string;
    companyName: string;
    quantity: number;
    avgBuyPrice: number;
    totalInvested: number;
    firstBuyDate: Date;
    lastBuyDate: Date;
}

export interface IPaperPortfolio extends Document {
    userId: mongoose.Types.ObjectId;
    cashBalance: number;
    startingBalance: number;
    totalDeposited: number;
    holdings: IHolding[];
    createdAt: Date;
    updatedAt: Date;
    lastResetAt?: Date;
    totalHoldingsValue: number; // Virtual
    getHolding(symbol: string): IHolding | undefined;
}

const HoldingSchema = new Schema<IHolding>({
    symbol: { type: String, required: true },
    displaySymbol: { type: String, required: true },
    companyName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    avgBuyPrice: { type: Number, required: true },
    totalInvested: { type: Number, required: true },
    firstBuyDate: { type: Date, required: true },
    lastBuyDate: { type: Date, required: true }
}, { _id: false });

const PaperPortfolioSchema = new Schema<IPaperPortfolio>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cashBalance: { type: Number, default: 1000000 },
    startingBalance: { type: Number, default: 1000000 },
    totalDeposited: { type: Number, default: 1000000 },
    holdings: [HoldingSchema],
    lastResetAt: { type: Date }
}, { timestamps: true });

// Virtual for total holdings value
PaperPortfolioSchema.virtual('totalHoldingsValue').get(function () {
    return 0; // Value computed at query time with live prices
});

// Method to get a specific holding
PaperPortfolioSchema.methods.getHolding = function (symbol: string): IHolding | undefined {
    return this.holdings.find((h: IHolding) => h.symbol === symbol);
};

// Ensure virtuals are included in toJSON
PaperPortfolioSchema.set('toJSON', { virtuals: true });
PaperPortfolioSchema.set('toObject', { virtuals: true });

export default mongoose.models.PaperPortfolio || mongoose.model<IPaperPortfolio>('PaperPortfolio', PaperPortfolioSchema);
