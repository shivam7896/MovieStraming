import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/proxy': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/m3u8-proxy': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ts-proxy': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/sub-proxy': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
