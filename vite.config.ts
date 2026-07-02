import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  // 生产环境使用相对路径，修复CF Pages静态资源404
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      '/memos-api': {
        target: 'https://memo.z2m.store',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/memos-api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
