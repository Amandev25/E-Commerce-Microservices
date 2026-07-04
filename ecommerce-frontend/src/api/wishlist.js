import api from './client.js';

export function getWishlist() {
  return api.get('/wishlist').then((r) => r.data);
}

// Add if missing, remove if already there. Returns the updated list of product ids.
export function toggleWishlist(productId) {
  return api.post(`/wishlist/${productId}`).then((r) => r.data);
}

export function removeFromWishlist(productId) {
  return api.delete(`/wishlist/${productId}`).then((r) => r.data);
}
