// src/controllers/order.controller.js
import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Coupon from '../models/coupon.model.js';

// PLACE an order from the user's cart (user) --------------
export const placeOrder = async (req, res) => {
  // A session is the "container" that groups our writes into one transaction.
  const session = await mongoose.startSession();

  try {
    const { shippingAddress, couponCode } = req.body;

    // Basic validation BEFORE opening the transaction (cheap checks first).
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    // Load the cart (populate products so we can read live stock + name).
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // ===== START THE TRANSACTION =====
    session.startTransaction();

    // Build the order items (snapshot) and compute the total.
    const orderItems = [];
    let itemsTotal = 0;

    for (const item of cart.items) {
      const product = item.product; // populated product document

      // The product could have been deleted after it was added to the cart.
      if (!product) {
        throw new Error('A product in your cart no longer exists');
      }

      // ATOMIC conditional stock decrement — the anti-overselling core.
      // "Decrease stock by quantity, but ONLY if there's enough right now."
      const updated = await Product.updateOne(
        { _id: product._id, stock: { $gte: item.quantity } }, // condition: enough stock
        { $inc: { stock: -item.quantity } },                   // action: subtract atomically
        { session }                                            // part of the transaction
      );

      // If nothing was modified, the condition failed → not enough stock.
      if (updated.modifiedCount === 0) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      // Snapshot this line into the order.
      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.priceSnapshot, // the price captured when added to cart
        quantity: item.quantity,
      });
      itemsTotal += item.priceSnapshot * item.quantity;
    }

    // Handle the coupon (re-validate, then CONSUME it — this is where usedCount finally moves).
    let discount = 0;
    let appliedCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);

      // Re-run the key validity checks (don't trust that "apply" happened honestly).
      const valid =
        coupon &&
        coupon.isActive &&
        coupon.expiresAt > new Date() &&
        (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) &&
        itemsTotal >= coupon.minCartValue;

      if (!valid) {
        throw new Error('Coupon is invalid or not applicable');
      }

      // Compute discount (same rules as the coupon module).
      if (coupon.type === 'percent') {
        discount = (itemsTotal * coupon.value) / 100;
        if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
      } else {
        discount = coupon.value;
      }
      if (discount > itemsTotal) discount = itemsTotal;
      discount = Math.round(discount);
      appliedCode = coupon.code;

      // CONSUME the coupon — atomically, inside the transaction.
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } }, { session });
    }

    const finalTotal = itemsTotal - discount;

    // Create the order (inside the transaction). Note: Model.create with a session
    // takes an ARRAY and an options object.
    const [order] = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          itemsTotal,
          discount,
          couponCode: appliedCode,
          finalTotal,
        },
      ],
      { session }
    );

    // Empty the cart (inside the transaction too).
    cart.items = [];
    await cart.save({ session });

    // ===== EVERYTHING SUCCEEDED → COMMIT =====
    await session.commitTransaction();

    return res.status(201).json({ success: true, message: 'Order placed', data: order });
  } catch (error) {
    // ===== ANYTHING FAILED → ROLL BACK ALL WRITES =====
    await session.abortTransaction();
    console.error(error);
    // These thrown Errors are expected business rules → 400, not 500.
    return res.status(400).json({ success: false, message: error.message || 'Could not place order' });
  } finally {
    // Always release the session, success or failure.
    session.endSession();
  }
}; 

// MY order history (user) ---------------------------------
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, results: orders.length, data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ONE order (owner or admin) ------------------------------
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Ownership: your own order, or you're an admin.
    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed to view this order' });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ALL orders (admin) --------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, results: orders.length, data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE status (admin) -----------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = status;
    await order.save();
    return res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};