import mongoose from 'mongoose';

// A sub-schema for one line in the cart. No separate collection — it lives
// inside the cart document as an array element.
const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceSnapshot: { type: Number, required: true }, // the price WHEN added — set server-side
  },
  { _id: false } // these items don't need their own _id
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);