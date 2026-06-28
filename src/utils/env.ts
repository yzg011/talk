// src/utils/env.ts
export const ENV = {
  MEMOS_API_BASE: import.meta.env.VITE_MEMOS_BASE_URL,
  MEMOS_STATIC_HOST: import.meta.env.VITE_MEMOS_STATIC,
  MEMOS_TOKEN: import.meta.env.VITE_MEMOS_TOKEN,
}

// 图片地址转换函数（彻底解决localhost错误路径404）
export function getImageFullPath(rawPath: string) {
  if (!rawPath) return ''
  if (rawPath.startsWith('http')) return rawPath
  return `${ENV.MEMOS_STATIC_HOST}${rawPath}`
}

// 接口请求基础地址
export function getApiUrl(path: string) {
  return `${ENV.MEMOS_API_BASE}${path}`
}