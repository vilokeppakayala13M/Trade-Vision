import mongoose from 'mongoose';

const PaperAccountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balance: { type: Number, default: 1000000 },
    startingBalance: { type: Number, default: 1000000 },
    currency: { type: String, default: 'INR' },
    lastResetAt: { type: Date },
    version: { type: Number, default: 0 }
}, { timestamps: true, collection: 'paper_accounts' });

export default mongoose.models.PaperAccount || mongoose.model('PaperAccount', PaperAccountSchema);
