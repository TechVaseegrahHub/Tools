import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  toolName: {
    type: String,
    required: true,
    trim: true,
  },
  toolId: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Checked Out', 'Under Maintenance', 'Retired', 'Overdue'],
    default: 'Available',
  },
  purchaseDate: {
    type: Date,
  },
  location: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // URL to the image
    trim: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

// toolId is unique per org (not globally)
toolSchema.index({ toolId: 1, orgId: 1 }, { unique: true });
toolSchema.index({ toolName: 1 });
toolSchema.index({ status: 1 });

const Tool = mongoose.model('Tool', toolSchema);
export default Tool;