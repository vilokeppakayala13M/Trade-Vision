import mongoose from 'mongoose';

const PaperOrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    displaySymbol: { type: String },
    side: { type: String, enum: ['BUY', 'SELL', 'buy', 'sell'], required: true },
    type: { type: String, enum: ['MARKET', 'MARKET', 'market', 'limit', 'LIMIT'], default: 'market' },
    quantity: { type: Number, required: true, min: 1 },
    requestedPrice: { type: Number },
    filledPrice: { type: Number, required: true },
    totalValue: { type: Number },
    brokerage: { type: Number, default: 20 },
    netValue: { type: Number },
    status: { type: String, enum: ['pending', 'filled', 'rejected', 'cancelled'], default: 'filled' },
    rejectionReason: { type: String },
    filledAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'orders' });

PaperOrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.PaperOrder || mongoose.model('PaperOrder', PaperOrderSchema);
