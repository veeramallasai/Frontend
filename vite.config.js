import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_PROXY_TARGET is only used by the local dev server to proxy /api
  // requests to a locally running backend. It defaults to the Spring Boot
  // backend's default local port and has no effect in production, where
  // the frontend talks directly to VITE_API_BASE_URL / VITE_API_URL.
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
