// EXPORTS: MOCK_POSTS

import type { IPost } from '@/types/post';

export const MOCK_POSTS: IPost[] = [
  {
    id: 'mock-1',
    nick: '文案馆【312】',
    avatar: '',
    content: '今天天气真好，适合出去走走 🌿 分享一组随手拍的照片～',
    images: [
      'https://img.z2m.store/file/bg/1780919518075_9.jpg',
    ],
    created: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    like: 12,
    liked: false,
    replies: [
      {
        id: 'mock-r1',
        nick: '小明',
        avatar: '',
        content: '拍得真好看！',
        created: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: 'mock-r2',
        nick: '小红',
        avatar: '',
        content: '这是哪里呀？',
        created: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ],
    source: 'mock',
  },
  {
    id: 'mock-2',
    nick: '文案馆【312】',
    avatar: '',
    content: '新买的一本书到了 📚 期待已久，今晚开始读！',
    images: [],
    created: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    like: 8,
    liked: true,
    replies: [
      {
        id: 'mock-r3',
        nick: '书友小张',
        avatar: '',
        content: '这本书我也在看，很棒！',
        created: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
    source: 'mock',
  },
  {
    id: 'mock-3',
    nick: '文案馆【312】',
    avatar: '',
    content: '周末做了顿大餐 🍳 厨艺又进步了哈哈',
    images: [],
    created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    like: 25,
    liked: false,
    replies: [],
    source: 'mock',
  },
];
