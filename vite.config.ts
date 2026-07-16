import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  // 删除整个 server.proxy 配置，不再本地代理
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
