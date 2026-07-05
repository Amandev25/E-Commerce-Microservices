import api from './client.js';

// All of these hit admin-only endpoints (the backend checks the admin role).
// Read helpers for products/categories live in their own api files and are reused.

// ----- Orders -----
export const adminGetOrders = () => api.get('/orders').then((r) => r.data);
export const adminGetOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const adminUpdateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }).then((r) => r.data);

// ----- Products -----
export const adminCreateProduct = (data) => api.post('/products', data).then((r) => r.data);
export const adminUpdateProduct = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data);
export const adminDeleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);
export const adminUploadImages = (id, files) => {
  const form = new FormData();
  files.forEach((file) => form.append('images', file)); // field name must be "images"
  return api.post(`/products/${id}/images`, form).then((r) => r.data);
};

// ----- Categories -----
export const adminCreateCategory = (data) => api.post('/categories', data).then((r) => r.data);
export const adminUpdateCategory = (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data);
export const adminDeleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

// ----- Coupons -----
export const adminGetCoupons = () => api.get('/coupons').then((r) => r.data);
export const adminCreateCoupon = (data) => api.post('/coupons', data).then((r) => r.data);
export const adminUpdateCoupon = (id, data) => api.put(`/coupons/${id}`, data).then((r) => r.data);
export const adminDeleteCoupon = (id) => api.delete(`/coupons/${id}`).then((r) => r.data);
