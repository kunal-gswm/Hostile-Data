import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Proxy API requests through Vite's dev server to bypass CORS.
    // In production, this would be handled by your own backend or edge function.
    proxy: {
      '/api': {
        target: 'https://task1-nsaic.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  test: {
    environment: 'node',
  },
})
