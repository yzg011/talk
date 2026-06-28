// EXPORTS: getComments, postComment, deleteComment, likeComment, cancelLikeComment, uploadImage, TWIKOO_BASE_URL

export const TWIKOO_BASE_URL = 'http://192.166.0.117:8088';

// 简单的 logger，替代 lark-apaas 的 logger
const logger = {
  info: (msg: string) => console.log('[Twikoo API]', msg),
  error: (msg: string) => console.error('[Twikoo API]', msg),
};

interface TwikooComment {
  id: string;
  nick: string;
  mail: string;
  link: string;
  avatar: string;
  comment: string;
  created: string;
  updated: string;
  ip: string;
  rid: string;
  ua: string;
  url: string;
  like: number;
  isSpam: boolean;
}

interface TwikooResponse<T> {
  code: number;
  data: T;
  msg: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${TWIKOO_BASE_URL}${endpoint}`;
  logger.info(`${options?.method || 'GET'} ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error(`Error ${res.status}: ${text}`);
    throw new Error(`Twikoo API error: ${res.status} ${text}`);
  }

  const json: TwikooResponse<T> = await res.json();

  if (json.code !== 0) {
    logger.error(`Business error: ${json.msg}`);
    throw new Error(json.msg || 'Twikoo API business error');
  }

  return json.data;
}

export async function getComments(params: {
  url: string;
  page?: number;
  pageSize?: number;
}): Promise<TwikooComment[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('url', params.url);
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));

  return request<TwikooComment[]>(`/api/comment?${searchParams.toString()}`);
}

export async function postComment(params: {
  url: string;
  nick: string;
  mail: string;
  comment: string;
  rid?: string;
  avatar?: string;
}): Promise<TwikooComment> {
  return request<TwikooComment>('/api/comment', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function deleteComment(id: string): Promise<void> {
  await request<void>(`/api/comment/${id}`, {
    method: 'DELETE',
  });
}

export async function likeComment(id: string): Promise<void> {
  await request<void>('/api/comment/like', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function cancelLikeComment(id: string): Promise<void> {
  await request<void>('/api/comment/cancel-like', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${TWIKOO_BASE_URL}/api/upload`;
  logger.info(`Upload: POST ${url}`);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error(`Upload error ${res.status}: ${text}`);
    throw new Error(`Twikoo upload error: ${res.status}`);
  }

  const json: TwikooResponse<{ url: string }> = await res.json();

  if (json.code !== 0) {
    logger.error(`Upload business error: ${json.msg}`);
    throw new Error(json.msg || 'Twikoo upload error');
  }

  return json.data.url;
}
