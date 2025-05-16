import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { // Add this server configuration
    port: 5173, // Always try to use port 5173
    strictPort: true, // Fail if port 5173 is already in use
    proxy: {
      // Proxy /api requests to our Spring Boot backend
      '/api': {
        target: 'http://localhost:8080', // Your backend address
        changeOrigin: true, // Recommended for most setups
        // secure: false, // If your backend is HTTP and dev server is HTTPS (uncommon for local)
        // rewrite: (path) => path.replace(/^\/api/, '/api') // Usually not needed if backend paths are already /api/...
      }
    }
  }
})
