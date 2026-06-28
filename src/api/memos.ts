// EXPORTS: getMemos, createMemo, deleteMemo, likeMemo, unlikeMemo, getMemoComments, createMemoComment, uploadResource, MEMOS_BASE_URL, MEMOS_TOKEN

// 开发环境使用 Vite 代理解决跨域，生产环境使用真实地址
export const MEMOS_BASE_URL = '/memos-api';
export const MEMOS_TOKEN = 'memos_pat_aIUlu7UtBbXibmD6WHCEdQM9fEc1Mo44';

// 简单的 logger，替代 lark-apaas 的 logger，避免本地跨域错误
const logger = {
  info: (msg: string) => console.log('[Memos API]', msg),
  error: (msg: string) => console.error('[Memos API]', msg),
};

// 修复：增加 filename 字段，页面拼接图片路径必须用到
interface MemoAttachment {
  name: string;
  filename: string;
  type: string;
  size: string;
  externalLink?: string;
  width?: number;
  height?: number;
}

interface MemoReaction {
  id: string;
  reactionType: string;
  creator: string;
}

interface Memo {
  name: string;
  state: string;
  creator: string;
  createTime: string;
  updateTime: string;
  content: string;
  visibility: string;
  tags: string[];
  pinned: boolean;
  attachments: MemoAttachment[];
  relations: any[];
  reactions: MemoReaction[];
  snippet?: string;
}

interface ListMemosResponse {
  memos: Memo[];
  nextPageToken?: string;
  totalSize?: number;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${MEMOS_BASE_URL}${endpoint}`;
  logger.info(`${options?.method || 'GET'} ${url}`);

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEMOS_TOKEN}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error(`Error ${res.status}: ${text}`);
    throw new Error(`Memos API error: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * 获取 memo 列表
 */
export async function getMemos(params: {
  pageSize?: number;
  pageToken?: string;
  filter?: string;
}): Promise<ListMemosResponse> {
  const searchParams = new URLSearchParams();
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));
  if (params.pageToken) searchParams.set('pageToken', params.pageToken);
  if (params.filter) searchParams.set('filter', params.filter);

  return request<ListMemosResponse>(`/api/v1/memos?${searchParams.toString()}`);
}

/**
 * 创建 memo
 */
export async function createMemo(params: {
  content: string;
  visibility?: string;
  attachments?: { name: string; filename: string; type: string; size: string; externalLink?: string }[];
}): Promise<Memo> {
  return request<Memo>('/api/v1/memos', {
    method: 'POST',
    body: JSON.stringify({
      content: params.content,
      visibility: params.visibility || 'PUBLIC',
      attachments: params.attachments || [],
    }),
  });
}

/**
 * 删除 memo
 */
export async function deleteMemo(name: string): Promise<void> {
  await request<void>(`/api/v1/${name}`, {
    method: 'DELETE',
  });
}

/**
 * 点赞 memo
 */
export async function likeMemo(name: string): Promise<MemoReaction> {
  return request<MemoReaction>(`/api/v1/${name}/reactions`, {
    method: 'POST',
    body: JSON.stringify({
      reactionType: 'THUMBS_UP',
    }),
  });
}

/**
 * 取消点赞 memo
 */
export async function unlikeMemo(name: string, reactionId: string): Promise<void> {
  await request<void>(`/api/v1/${name}/reactions/${reactionId}`, {
    method: 'DELETE',
  });
}

/**
 * 获取 memo 评论（评论也是 memo 类型）
 */
export async function getMemoComments(name: string): Promise<Memo[]> {
  const result = await request<ListMemosResponse>(`/api/v1/${name}/comments`);
  return result.memos || [];
}

/**
 * 创建 memo 评论
 */
export async function createMemoComment(name: string, content: string): Promise<Memo> {
  return request<Memo>(`/api/v1/${name}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content,
    }),
  });
}

/**
 * 上传资源/图片（核心修改）
 */
export async function uploadResource(file: File): Promise<MemoAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  // 统一使用 MEMOS_BASE_URL，自动区分开发代理/生产域名
  const url = `${MEMOS_BASE_URL}/api/v1/attachments/`;
  logger.info(`Upload: POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MEMOS_TOKEN}`,
      // 不要加 Content-Type，浏览器自动携带 multipart/form-data
    },
    body: formData,
    credentials: 'include', // 新增携带会话凭证
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error(`Upload error ${res.status}: ${text}`);
    throw new Error(`Memos upload error: ${res.status}`);
  }

  return res.json();
}