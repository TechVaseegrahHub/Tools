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
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;