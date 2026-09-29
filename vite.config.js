import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_API_PROXY_TARGET || 'https://joana-unrevertible-gail.ngrok-free.dev'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['99c4-2401-4900-b7a6-9106-b149-36e8-3ef0-45d0.ngrok-free.app'],
      proxy: {
        '/api': { target: backend, changeOrigin: true, secure: true },
        '/oauth2': { target: backend, changeOrigin: true, secure: true },
        '/login/oauth2': { target: backend, changeOrigin: true, secure: true },
      },
    },
  }
})
