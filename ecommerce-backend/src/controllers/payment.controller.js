import crypto from 'crypto';           // Node built-in, no install
import razorpay from '../config/razorpay.js';
import config from '../config/env.js';
import Order from '../models/order.model.js';

// 1) CREATE a Razorpay order for one of our orders (user) -
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body; // our own Order's _id

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Ownership: you can only pay for your own order.
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your order' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    // Create the Razorpay order. amount MUST be in paise → × 100.
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(order.finalTotal * 100),
      currency: 'INR',
      receipt: `order_${order._id}`, // your own reference
    });

    // Remember the Razorpay order id on our order (we'll match on it later).
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    // Return what the frontend checkout needs. Note: only the PUBLIC key id
    // goes to the browser — never the secret.
    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,      // already in paise
        currency: rzpOrder.currency,
        key: config.razorpay.keyId,   // public key for the checkout popup
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Could not create payment order' });
  }
};

// 2) VERIFY the payment after checkout (user) -------------
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment fields' });
    }

    // Load the order first so we can confirm it's the caller's before touching it.
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your order' });
    }

    // Recompute the signature ourselves: HMAC-SHA256 of "orderId|paymentId".
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // If it doesn't match, the response was faked/tampered → mark failed
    // (but never overwrite an order that's already paid).
    if (expectedSignature !== razorpay_signature) {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        await order.save();
      }
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Signature is valid → mark paid, IDEMPOTENTLY.
    if (order.paymentStatus !== 'paid') {       // 👈 the idempotency guard
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpay_payment_id;
      order.status = 'processing';
      await order.save();
    }

    return res.status(200).json({ success: true, message: 'Payment verified', data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Verification error' });
  }
};

// 3) WEBHOOK — Razorpay calls this directly (backup path) -
// NOTE: req.body here is a RAW Buffer, not parsed JSON (see routing below).
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    // Verify against the RAW bytes with the WEBHOOK secret (different secret!).
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(req.body) // the raw buffer — must be exact bytes
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid webhook signature');
    }

    // Now that it's verified, parse the JSON.
    const event = JSON.parse(req.body.toString());

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id });

      // Same idempotency guard — the webhook may arrive after /verify already ran.
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.razorpayPaymentId = payment.id;
        order.status = 'processing';
        await order.save();
      }
    }

    // Always 200 once we've handled it, so Razorpay stops retrying.
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Webhook error');
  }
};