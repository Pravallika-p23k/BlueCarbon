import mongoose from 'mongoose';

const LedgerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projId: { type: String, required: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Retired'], default: 'Active' },
  serializedHash: { type: String, required: true }
}, { timestamps: true });

// ⬇️ MAKE SURE IT USES export default
export default mongoose.model('Ledger', LedgerSchema);
