import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

// Category names are unique per org
categorySchema.index({ name: 1, orgId: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;