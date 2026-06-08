import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080'
    },
    allowedHosts: ['sb-6kj27sf6gg9h.vercel.run']
  }
})
