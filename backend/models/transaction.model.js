import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  tool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['checkout', 'checkin'],
    required: true,
  },
  checkoutDate: {
    type: Date,
    default: Date.now,
  },
  expectedReturnDate: {
    type: Date, // Only required for 'checkout'
  },
  actualReturnDate: {
    type: Date, // Only set on 'checkin'
  },
  notes: {
    type: String,
    trim: true
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

// Indexes for fast queries
transactionSchema.index({ tool: 1, type: 1 });
transactionSchema.index({ orgId: 1, createdAt: -1 }); // For recent-by-org queries
transactionSchema.index({ orgId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;