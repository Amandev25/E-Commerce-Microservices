import api from './client.js';

// Get a page of products. `params` can include:
//   keyword, category, minPrice, maxPrice, sort, page, limit
// The backend returns { success, results, page, totalPages, totalProducts, data }.
export function getProducts(params = {}) {
  return api.get('/products', { params }).then((r) => r.data);
}

// Get one product by its id. Returns { success, data }.
export function getProduct(id) {
  return api.get(`/products/${id}`).then((r) => r.data);
}
