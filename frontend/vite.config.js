import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure assets use root-relative paths — required for CPanel/Apache hosting
  base: '/',
  build: {
    outDir: 'dist',
    // Generate source maps only in development to reduce build size
    sourcemap: false,
    // Raise chunk size warning limit (some pages are large)
    chunkSizeWarningLimit: 1000,
  }
})
