import api from './client.js';

// Public: all reviews for a product.
export function getProductReviews(productId) {
  return api.get(`/products/${productId}/reviews`).then((r) => r.data);
}

// Logged-in user: add a review to a product.
export function addReview(productId, { rating, comment }) {
  return api.post(`/products/${productId}/reviews`, { rating, comment }).then((r) => r.data);
}
