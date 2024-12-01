import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.1.12',
    port: 5173
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts"
  }
})
