import mongoose from 'mongoose';

const PaperPositionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    displaySymbol: { type: String },
    companyName: { type: String },
    side: { type: String, default: 'long' },
    quantity: { type: Number, required: true, min: 0 },
    avgEntryPrice: { type: Number, required: true },
    totalInvested: { type: Number, required: true }
}, { timestamps: true, collection: 'positions' });

PaperPositionSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default mongoose.models.PaperPosition || mongoose.model('PaperPosition', PaperPositionSchema);
