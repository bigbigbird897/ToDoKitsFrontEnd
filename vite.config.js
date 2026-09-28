import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 前端开发服务器；/api 代理到后端（默认 http://localhost:5000，可改）
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9610',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500
  }
})
