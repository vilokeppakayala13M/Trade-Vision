import mongoose from 'mongoose';

const AccountLedgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaperOrder' },
    type: { type: String, enum: ['trade', 'reset', 'adjustment'], required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true, collection: 'account_ledger' });

AccountLedgerSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.AccountLedger || mongoose.model('AccountLedger', AccountLedgerSchema);
