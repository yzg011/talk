import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { MOCK_PROFILE } from '@/data/profile';
import { MOCK_POSTS } from '@/data/posts';
import {
  getMemos,
  createMemo,
  deleteMemo,
  likeMemo,
  unlikeMemo,
  getMemoComments,
  createMemoComment,
  uploadResource,
  MEMOS_BASE_URL,
} from '@/api/memos';
import type { IPost, IReply } from '@/types/post';

import ProfileSection from './sections/ProfileSection';
import PublishSection from './sections/PublishSection';
import TimelineSection from './sections/TimelineSection';
import ImagePreview from './sections/ImagePreview';

const PAGE_SIZE = 10;
const API_PREFIX = '/memos-api';

export default function HomePage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  /**
   * 图片地址拼接：name + filename 完整路径
   */
  const extractImagesFromMemo = (attachments?: any[]): string[] => {
    if (!Array.isArray(attachments) || attachments.length === 0) return [];
    return attachments
      .filter((a) => a.type?.startsWith('image/'))
      .map((a) => {
        if (a.externalLink) return a.externalLink;
        if (!a.name || !a.filename) return '';
        return `${API_PREFIX}/file/${a.name}/${a.filename}`;
      })
      .filter(Boolean);
  };

  /**
   * 点赞状态计算
   */
  const extractLikeInfo = (reactions?: any[], userId?: string) => {
    const thumbsUp = reactions?.filter((r) => r.reactionType === 'THUMBS_UP') || [];
    const myReaction = thumbsUp.find((r) => r.creatorId === userId);
    return {
      likeCount: thumbsUp.length,
      liked: !!myReaction,
      myReactionId: myReaction?.id ?? null,
    };
  };

  /**
   * 批量获取单页所有memo的评论
   */
  const fetchAllCommentsForMemos = useCallback(async (memos: any[]) => {
    // 并发请求每条动态评论
    const memoWithComments = await Promise.all(
      memos.map(async (memo) => {
        try {
          const comments = await getMemoComments(memo.name);
          const replies: IReply[] = comments.map((c) => ({
            id: c.name || c.uid || `r-${Math.random()}`,
            nick: MOCK_PROFILE.nick,
            avatar: MOCK_PROFILE.avatar,
            content: c.content,
            created: c.createTime || new Date().toISOString(),
          }));
          return { ...memo, preloadedReplies: replies };
        } catch (err) {
          console.error(`加载评论失败 memo ${memo.name}:`, err);
          return { ...memo, preloadedReplies: [] };
        }
      })
    );
    return memoWithComments;
  }, []);

  /* 加载列表（新增自动预加载全部评论逻辑） */
  const loadPosts = useCallback(async (pageToken?: string) => {
    try {
      setError(null);
      if (!pageToken) setLoading(true);

      const result = await getMemos({
        pageSize: PAGE_SIZE,
        pageToken,
      });

      // 首页加载时，批量拉取本条分页所有动态的评论
      const memosWithComments = await fetchAllCommentsForMemos(result.memos);

      const apiPosts: IPost[] = memosWithComments.map((memo) => {
        const images = extractImagesFromMemo(memo.attachments);
        const likeInfo = extractLikeInfo(memo.reactions, undefined);
        return {
          id: memo.name,
          nick: MOCK_PROFILE.nick,
          avatar: MOCK_PROFILE.avatar,
          content: memo.content || '',
          images,
          created: memo.createTime || new Date().toISOString(),
          like: likeInfo.likeCount,
          liked: likeInfo.liked,
          myReactionId: likeInfo.myReactionId,
          // 预加载的评论直接赋值，打开页面就有
          replies: memo.preloadedReplies || [],
          source: 'api' as const,
        };
      });

      if (!pageToken) {
        setPosts(apiPosts);
      } else {
        setPosts((prev) => [...prev, ...apiPosts]);
      }

      setNextPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载失败';
      console.error('Failed to load posts:', err);

      if (!pageToken) {
        setError(msg);
        setPosts(MOCK_POSTS);
      } else {
        toast.error('加载更多失败');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAllCommentsForMemos]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadPosts();
    }
  }, [loadPosts]);

  /* 加载评论（保留，兼容手动刷新评论逻辑） */
  const loadComments = useCallback(async (postId: string) => {
    if (loadingComments.has(postId)) return;

    const post = posts.find((p) => p.id === postId);
    if (!post || post.source === 'mock') return;

    setLoadingComments((prev) => new Set(prev).add(postId));

    try {
      const comments = await getMemoComments(postId);
      const replies: IReply[] = comments.map((c) => ({
        id: c.name || c.uid || `r-${Math.random()}`,
        nick: MOCK_PROFILE.nick,
        avatar: MOCK_PROFILE.avatar,
        content: c.content,
        created: c.createTime || new Date().toISOString(),
      }));

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, replies } : p)),
      );
    } catch (err) {
      console.error('Failed to load comments:', err);
      toast.error('评论加载失败');
    } finally {
      setLoadingComments((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }, [posts, loadingComments]);

  /* 发布动态（修复上传逻辑，完整保存filename） */
  const handlePublish = useCallback(async (content: string, imageFiles: File[]) => {
    try {
      const uploadedResources = [];
      // 循环上传每张图片
      for (const file of imageFiles) {
        const resource = await uploadResource(file);
        // 必须携带 filename，否则拼接图片地址会失效
        uploadedResources.push({
          name: resource.name,
          filename: resource.filename,
          type: resource.type,
          size: resource.size,
          externalLink: resource.externalLink,
        });
      }

      // 创建备忘录
      const result = await createMemo({
        content: content.trim() || ' ',
        visibility: 'PUBLIC',
        attachments: uploadedResources,
      });

      // 生成图片列表
      const images = extractImagesFromMemo(result.attachments || uploadedResources);
      const newPost: IPost = {
        id: result.name,
        nick: MOCK_PROFILE.nick,
        avatar: MOCK_PROFILE.avatar,
        content,
        images,
        created: result.createTime || new Date().toISOString(),
        like: 0,
        liked: false,
        myReactionId: null,
        replies: [], // 新建动态暂无评论
        source: 'api',
      };
      setPosts((prev) => [newPost, ...prev]);
      toast.success('发布成功');
    } catch (err) {
      console.error('发布/上传失败：', err);
      toast.error('图片上传或发布失败，请重试');
      throw err;
    }
  }, []);

  /* 删除 */
  const handleDelete = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.source === 'mock') {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return;
    }

    try {
      await deleteMemo(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('删除成功');
    } catch {
      toast.error('删除失败');
    }
  }, [posts]);

  /* 点赞 */
  const handleLike = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || post.liked) return;

    if (post.source === 'mock') {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked: true, like: p.like + 1 } : p,
        ),
      );
      return;
    }

    try {
      const reaction = await likeMemo(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: true, like: p.like + 1, myReactionId: reaction.id }
            : p,
        ),
      );
    } catch {
      toast.error('点赞失败');
    }
  }, [posts]);

  /* 取消点赞 */
  const handleUnlike = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post || !post.liked) return;

    if (post.source === 'mock') {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, liked: false, like: Math.max(0, p.like - 1) } : p,
        ),
      );
      return;
    }

    try {
      if (post.myReactionId) {
        await unlikeMemo(postId, post.myReactionId);
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: false, like: Math.max(0, p.like - 1), myReactionId: null }
            : p,
        ),
      );
    } catch {
      toast.error('取消点赞失败');
    }
  }, [posts]);

  /* 评论 */
  const handleComment = useCallback(async (postId: string, content: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.source === 'mock') {
      const newReply: IReply = {
        id: `mock-r-${Date.now()}`,
        nick: MOCK_PROFILE.nick,
        avatar: MOCK_PROFILE.avatar,
        content,
        created: new Date().toISOString(),
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p,
        ),
      );
      return;
    }

    try {
      const result = await createMemoComment(postId, content);
      const newReply: IReply = {
        id: result.name || result.uid || `r-${Date.now()}`,
        nick: MOCK_PROFILE.nick,
        avatar: MOCK_PROFILE.avatar,
        content,
        created: result.createTime || new Date().toISOString(),
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p,
        ),
      );
      toast.success('评论成功');
    } catch {
      toast.error('评论发布失败');
    }
  }, [posts]);

  /* 加载更多 */
  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore) return;
    loadPosts(nextPageToken);
  }, [loading, hasMore, nextPageToken, loadPosts]);

  /* 图片预览 */
  const handleImageClick = useCallback((images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setPreviewOpen(true);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[640px] mx-auto px-4 py-8 md:py-12 space-y-8">
        <ProfileSection profile={MOCK_PROFILE} />
        <PublishSection onPublish={handlePublish} />
        <TimelineSection
          posts={posts}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onDelete={handleDelete}
          onComment={handleComment}
          onImageClick={handleImageClick}
          onLoadComments={loadComments}
          loadingComments={loadingComments}
        />
      </main>
      <ImagePreview
        images={previewImages}
        initialIndex={previewIndex}
        open={previewOpen}
        onClose={handlePreviewClose}
      />
    </div>
  );
}
