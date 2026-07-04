import mongoose from 'mongoose';

// Each order line is a SNAPSHOT copied in at purchase time — not a live ref.
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // keep the id for reference
    name: { type: String, required: true },      // copied in — survives product edits/deletion
    price: { type: Number, required: true },      // the price actually paid
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    itemsTotal: { type: Number, required: true },  // before discount
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    finalTotal: { type: Number, required: true },  // what they actually pay

    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid', // the Payments module updates this
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);