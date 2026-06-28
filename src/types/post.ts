// EXPORTS: IPost, IReply

export interface IPost {
  /** 唯一标识 (memos 使用 name, twikoo 使用 id) */
  id: string;
  /** 发布者昵称 */
  nick: string;
  /** 发布者头像 URL */
  avatar: string;
  /** 动态文字内容 */
  content: string;
  /** 图片 URL 数组 */
  images: string[];
  /** 发布时间 (ISO 字符串) */
  created: string;
  /** 点赞数 */
  like: number;
  /** 当前用户是否已点赞 */
  liked: boolean;
  /** 当前用户的点赞反应 ID (memos 用) */
  myReactionId?: string | null;
  /** 子评论列表 */
  replies: IReply[];
  /** 数据来源标识 */
  source: 'api' | 'mock';
}

export interface IReply {
  /** 子评论 ID */
  id: string;
  /** 评论者昵称 */
  nick: string;
  /** 评论者头像 URL */
  avatar: string;
  /** 评论内容 */
  content: string;
  /** 评论时间 (ISO 字符串) */
  created: string;
}
