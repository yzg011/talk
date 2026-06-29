import path from 'path'
import { defineConfig } from '@lark-apaas/coding-preset-vite-react'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      // 开发环境代理 memos API，解决跨域问题
      '/memos-api': {
        target: 'https://memo.z2m.store',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/memos-api/, ''),
      },
    },
  },
}),

import { createHtmlPlugin } from 'vite-plugin-html'
export default defineConfig({
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          appName: '我的说说',
          appAvatar: '',
          appDescription: ''
        }
      }
    })
  ]
})
