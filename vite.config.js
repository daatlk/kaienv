import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/' as base URL for Vercel deployment
  base: '/',
  // Add build options for better compatibility
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    // Ensure proper handling of dynamic imports
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Configure server options
  server: {
    // Ensure proper host for development
    host: '0.0.0.0',
    // Add CORS headers for development
    cors: true
  }
})
