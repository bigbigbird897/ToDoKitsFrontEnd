import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 前端开发服务器；/api 代理到后端（默认 http://localhost:5000，可改）
export default defineConfig({
  // 否则访问 `/todokits/` 打开页面后，js/css 等资源会请求 `/js/xxx.js`（而不是 `/showproducts/js/xxx.js`），静态资源全部 404。
  base: '/todokits/', // ✅ 就是你Nginx子路径部署要用的
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
