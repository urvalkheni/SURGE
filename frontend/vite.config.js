import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/states': 'http://127.0.0.1:8000',
      '/cities': 'http://127.0.0.1:8000',
      '/areas': 'http://127.0.0.1:8000',
      '/forecast': 'http://127.0.0.1:8000',
      '/train': 'http://127.0.0.1:8000',
      '/metrics': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/dispatch': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
    }
  }
})
