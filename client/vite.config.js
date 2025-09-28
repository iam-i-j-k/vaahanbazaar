import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    allowedHosts: [
      'sendable-viperish-isla.ngrok-free.dev' // your ngrok URL
    ],
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  plugins: [react(),tailwindcss()],
})
