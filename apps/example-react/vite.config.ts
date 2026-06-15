import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The frontend calls `/api/*` (same-origin) and Vite proxies to example-rest.
// This keeps it working inside sandboxed preview browsers that only expose the
// dev-server port. Point `API_TARGET` elsewhere if your backend isn't on :3000.
// Use 127.0.0.1 (not "localhost") so we always hit the IPv4 backend and never
// get shadowed by an unrelated IPv6 dev server on the same port.
const API_TARGET = process.env["API_TARGET"] ?? "http://127.0.0.1:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
