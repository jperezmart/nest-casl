import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The oRPC backend serves under /api (the contract's prefix), so we proxy /api
// straight through WITHOUT rewriting the path. IPv4 to dodge the IPv6 :3000 squatter.
const API_TARGET = process.env['API_TARGET'] ?? 'http://127.0.0.1:3002';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
});
