import { useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IPost } from '@/types/post';
import PostCard from './PostCard';

interface TimelineSectionProps {
  posts: IPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onImageClick: (images: string[], index: number) => void;
  onLoadComments?: (postId: string) => void;
  loadingComments?: Set<string>;
}

export default memo(function TimelineSection({
  posts,
  loading,
  error,
  hasMore,
  onLoadMore,
  onLike,
  onUnlike,
  onDelete,
  onComment,
  onImageClick,
  onLoadComments,
  loadingComments,
}: TimelineSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  /* ── 初始加载骨架屏 ── */
  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-card p-5 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── 错误态（无数据时） ── */
  if (error && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <p className="text-foreground font-medium mb-2">加载失败</p>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">{error}</p>
        <Button variant="outline" onClick={onLoadMore}>
          重试
        </Button>
      </div>
    );
  }

  /* ── 空态 ── */
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-24 rounded-full bg-accent/50 flex items-center justify-center mb-4">
          <MessageCircle className="size-10 text-primary/60" />
        </div>
        <p className="text-foreground font-medium mb-2">暂无动态</p>
        <p className="text-sm text-muted-foreground">来发布第一条动态吧 ✨</p>
      </div>
    );
  }

  /* ── 正常列表 ── */
  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{
              duration: 0.4,
              delay: Math.min(index * 0.05, 0.3),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <PostCard
              post={post}
              onLike={() => (post.liked ? onUnlike(post.id) : onLike(post.id))}
              onDelete={() => onDelete(post.id)}
              onComment={(content) => onComment(post.id, content)}
              onImageClick={(imgIndex) => onImageClick(post.images, imgIndex)}
              onLoadComments={onLoadComments ? () => onLoadComments(post.id) : undefined}
              loadingComments={loadingComments?.has(post.id) || false}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 无限滚动哨兵 */}
      <div ref={sentinelRef} className="h-4" />

      {/* 加载更多指示器 */}
      {loading && posts.length > 0 && (
        <div className="flex items-center justify-center py-4 gap-2">
          <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">加载中...</span>
        </div>
      )}

      {/* 到底提示 */}
      {!hasMore && posts.length > 0 && !loading && (
        <p className="text-center text-xs text-muted-foreground py-4">
          — 已经到底了 —
        </p>
      )}
    </div>
  );
});
