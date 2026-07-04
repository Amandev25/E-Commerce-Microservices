import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// COMPOUND UNIQUE INDEX: the PAIR (user + product) must be unique.
// One user can review many products, and a product gets many reviews,
// but the same user can't review the same product twice.
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);