import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  base: './', // 保留相对路径，本地打包逻辑不变
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
