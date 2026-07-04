import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server runs on port 3000 because the backend's CORS is configured
// to allow http://localhost:3000 (CLIENT_URL). Keeping this in sync is what lets
// the login refresh-token cookie work in development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
