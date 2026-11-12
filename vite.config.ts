/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { apiOrigin, netlifyCsp } from './build/csp.ts'

const LOCAL_API = 'http://localhost:8000'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiUrl = env.VITE_API_URL || LOCAL_API

  if (command === 'build' && mode !== 'test') {
    apiOrigin(apiUrl) // throws on a malformed URL
    if (process.env.NETLIFY === 'true' && !env.VITE_API_URL) {
      throw new Error('VITE_API_URL is not set. Set it in Netlify > Site configuration > Environment variables.')
    }
    if (!env.VITE_API_URL) {
      console.warn(`[gpradar] VITE_API_URL is not set; building against ${LOCAL_API}.`)
    }
  }

  return {
    plugins: [react(), netlifyCsp(apiUrl)],
    server: { port: 5173, strictPort: true },
    preview: { port: 4173 },
    build: { target: 'es2022', sourcemap: false },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
    },
  }
})
