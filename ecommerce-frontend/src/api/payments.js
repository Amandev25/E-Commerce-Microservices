import api from './client.js';

// Ask the backend to create a Razorpay order for one of our orders.
// Returns { success, data: { razorpayOrderId, amount, currency, key } }.
export function createPaymentOrder(orderId) {
  return api.post('/payments/create-order', { orderId }).then((r) => r.data);
}

// After the Razorpay popup succeeds, send the signature back to verify it.
export function verifyPayment(payload) {
  return api.post('/payments/verify', payload).then((r) => r.data);
}
