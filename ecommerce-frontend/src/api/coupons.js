import api from './client.js';

// Preview a coupon against the user's current cart.
// Returns { success, data: { code, discount, cartTotal, finalTotal } }.
export function applyCoupon(code) {
  return api.post('/coupons/apply', { code }).then((r) => r.data);
}
