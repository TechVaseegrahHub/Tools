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
    unique: true,
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
  }
}, { timestamps: true });

const Tool = mongoose.model('Tool', toolSchema);
export default Tool;