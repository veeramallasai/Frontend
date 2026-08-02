import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8081'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
