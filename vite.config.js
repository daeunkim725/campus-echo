import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { base44Plugin } from '@base44/vite-plugin';
import path from "path";

export default defineConfig({
  plugins: [react(), base44Plugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
      // Mock the base44 API locally for verification
      proxy: {
          '/api/functions': {
              target: 'http://localhost:5173',
              bypass: function (req, res, options) {
                  if (req.url.includes('/api/functions/authMe')) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ id: "admin_123", email: "admin@campusecho.app", role: "admin", school: "ETH", school_verified: true }));
                      return true;
                  }
                  if (req.url.includes('/api/functions/')) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({})); // Empty json for everything else
                      return true;
                  }
              }
          }
      }
  }
});
