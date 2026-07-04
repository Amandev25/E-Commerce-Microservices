import api from './client.js';

// All cart routes require login. Each returns { success, data: { items, total } }.

export function getCart() {
  return api.get('/cart').then((r) => r.data);
}

export function addToCart(productId, quantity = 1) {
  return api.post('/cart/items', { productId, quantity }).then((r) => r.data);
}

export function updateCartItem(productId, quantity) {
  return api.put(`/cart/items/${productId}`, { quantity }).then((r) => r.data);
}

export function removeCartItem(productId) {
  return api.delete(`/cart/items/${productId}`).then((r) => r.data);
}

export function clearCart() {
  return api.delete('/cart').then((r) => r.data);
}
