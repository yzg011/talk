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
  // 全线上环境，不再使用本地开发代理，注释整个proxy
  // server: {
  //   proxy: {
  //     '/memos-api': {
  //       target: 'https://memo.z2m.store',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/memos-api/, ''),
  //     },
  //   },
  // },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
