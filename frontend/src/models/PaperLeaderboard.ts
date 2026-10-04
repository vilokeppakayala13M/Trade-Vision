import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperLeaderboard extends Document {
    userId: mongoose.Types.ObjectId;
    displayName: string;
    totalReturn: number;
    totalReturnAbsolute: number;
    currentPortfolioValue: number;
    tradeCount: number;
    winRate: number;
    bestTrade: {
        symbol: string;
        returnPercent: number;
    };
    rank: number;
    lastUpdated: Date;
}

const PaperLeaderboardSchema = new Schema<IPaperLeaderboard>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    displayName: { type: String, required: true },
    totalReturn: { type: Number, required: true },
    totalReturnAbsolute: { type: Number, required: true },
    currentPortfolioValue: { type: Number, required: true },
    tradeCount: { type: Number, required: true },
    winRate: { type: Number, required: true },
    bestTrade: {
        symbol: { type: String },
        returnPercent: { type: Number }
    },
    rank: { type: Number },
    lastUpdated: { type: Date, default: Date.now }
});

PaperLeaderboardSchema.index({ totalReturn: -1 });

export default mongoose.models.PaperLeaderboard || mongoose.model<IPaperLeaderboard>('PaperLeaderboard', PaperLeaderboardSchema);
