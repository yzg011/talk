
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // 相对路径，本地打开html不404资源
  plugins: [react()],
})
