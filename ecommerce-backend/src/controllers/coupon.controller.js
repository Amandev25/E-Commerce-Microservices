import Coupon from '../models/coupon.model.js';
import Cart from '../models/cart.model.js';

// Same total helper as the cart — sum of price × quantity.
const calculateCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

// APPLY a coupon (user) — the star of the module ----------
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    // Build the cart total SERVER-SIDE from the user's real cart.
    // We never accept a "cartTotal" from the request — same rule as the price snapshot.
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }
    const cartTotal = calculateCartTotal(cart.items);

    // Box 2 — find the coupon (uppercase to match how it's stored).
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    // Box 3 — the three validity checks, each its own guard clause.
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is not active' });
    }
    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
    }

    // Box 4 — minimum cart value.
    if (cartTotal < coupon.minCartValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ${coupon.minCartValue} required`,
      });
    }

    // Box 5 — calculate the discount.
    let discount;
    if (coupon.type === 'percent') {
      discount = (cartTotal * coupon.value) / 100;
      // apply the cap, if the coupon has one
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value; // flat amount
    }
    // Safety: never discount more than the cart is worth.
    if (discount > cartTotal) discount = cartTotal;
    discount = Math.round(discount);

    // Box 6 — return the preview. Note: we did NOT touch usedCount.
    return res.status(200).json({
      success: true,
      message: 'Coupon applied',
      data: {
        code: coupon.code,
        discount,
        cartTotal,
        finalTotal: cartTotal - discount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CREATE (admin) ------------------------------------------
export const createCoupon = async (req, res) => {
  try {
    const { code, type, value, expiresAt } = req.body;
    if (!code || !type || value === undefined || !expiresAt) {
      return res.status(400).json({ success: false, message: 'code, type, value and expiresAt are required' });
    }
    const coupon = await Coupon.create(req.body);
    return res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// LIST (admin) --------------------------------------------
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, results: coupons.length, data: coupons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE (admin) ------------------------------------------
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    const fields = ['code', 'type', 'value', 'minCartValue', 'maxDiscount', 'expiresAt', 'usageLimit', 'isActive'];
    for (const field of fields) {
      if (req.body[field] !== undefined) coupon[field] = req.body[field];
    }
    await coupon.save();
    return res.status(200).json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE (admin) ------------------------------------------
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    return res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};