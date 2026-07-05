import axios from 'axios';

// One axios instance for the whole app. Every request goes through here.
const api = axios.create({
  // In production, set VITE_API_URL (e.g. https://your-api.onrender.com/api/v1).
  // Locally it falls back to the dev backend.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  // Needed so the browser sends/receives the httpOnly refresh-token cookie.
  withCredentials: true,
});

// Before every request, attach the access token (if we have one) as a
// "Authorization: Bearer <token>" header. The backend's auth middleware reads this.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
