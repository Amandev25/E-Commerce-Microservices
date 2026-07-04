import api from './client.js';

// Turns the user's cart into an order. `shippingAddress` is required;
// `couponCode` is optional. Returns { success, data: order }.
export function placeOrder({ shippingAddress, couponCode }) {
  return api.post('/orders', { shippingAddress, couponCode }).then((r) => r.data);
}

export function getMyOrders() {
  return api.get('/orders/my').then((r) => r.data);
}

export function getOrder(id) {
  return api.get(`/orders/${id}`).then((r) => r.data);
}
