import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // uppercase = "save10" and "SAVE10" are the same
    type: { type: String, enum: ['percent', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },           // 10 (percent) or 200 (flat)
    minCartValue: { type: Number, default: 0 },                // cart must be at least this
    maxDiscount: { type: Number, default: null },              // cap for percent coupons (null = no cap)
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: null },               // null = unlimited
    usedCount: { type: Number, default: 0 },                   // bumped at ORDER time, not apply time
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);