import api from './client.js';

// Each function returns the backend's JSON body (the { success, message, data } shape).

export function register({ name, email, password }) {
  return api.post('/auth/register', { name, email, password }).then((r) => r.data);
}

export function login({ email, password }) {
  return api.post('/auth/login', { email, password }).then((r) => r.data);
}

export function logout() {
  return api.post('/auth/logout').then((r) => r.data);
}

// Uses the httpOnly refresh cookie to get a fresh access token.
export function refresh() {
  return api.post('/auth/refresh').then((r) => r.data);
}

// Returns the currently logged-in user (needs a valid access token).
export function getMe() {
  return api.get('/auth/me').then((r) => r.data);
}
