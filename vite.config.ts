import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      // Proxy API requests through Vite's dev server to bypass CORS.
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'https://task1-nsaic.vercel.app',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    test: {
      environment: 'node',
    },
  }
})
