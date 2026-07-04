import api from './client.js';

// Returns all categories: { success, results, data }.
export function getCategories() {
  return api.get('/categories').then((r) => r.data);
}
