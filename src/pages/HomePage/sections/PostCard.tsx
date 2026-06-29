import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Trash2, Send, ChevronDown, ChevronUp, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Image } from '@/components/ui/image';
import { formatRelativeTime } from '@/lib/date';
import type { IPost } from '@/types/post';

interface PostCardProps {
  post: IPost;
  onLike: () => void;
  onUnlike: () => void;
  onDelete: () => void;
  onComment: (content: string) => void;
  onImageClick: (imgIndex: number) => void;
  onLoadComments?: () => void;
  loadingComments?: boolean;
}

export default function PostCard({
  post,
  onLike,
  onUnlike,
  onDelete,
  onComment,
  onImageClick,
  onLoadComments,
  loadingComments = false,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // 仅无评论打开时才启用首次加载标记
  const [isFirstOpen, setIsFirstOpen] = useState(false);

  // 展开评论
  useEffect(() => {
    if (showComments) {
      // 关键判断：已有评论，不开启加载占位
      if (post.replies.length > 0) {
        setIsFirstOpen(false);
      } else {
        // 无评论，打开时启用加载标记
        setIsFirstOpen(true);
        if (onLoadComments && !loadingComments) {
          onLoadComments();
        }
      }
    } else {
      setIsFirstOpen(false);
    }
  }, [showComments, onLoadComments, post.replies.length, loadingComments]);

  // 仅无评论加载完成后清除标记
  useEffect(() => {
    if (!loadingComments && isFirstOpen && post.replies.length === 0) {
      const timer = setTimeout(() => setIsFirstOpen(false), 50);
      return () => clearTimeout(timer);
    }
  }, [loadingComments, isFirstOpen, post.replies.length]);

  const handleReplySubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = replyText.trim();
      if (!trimmed || submittingReply) return;

      setSubmittingReply(true);
      try {
        onComment(trimmed);
        setReplyText('');
      } catch {
        toast.error('评论发布失败，请稍后重试');
      } finally {
        setSubmittingReply(false);
      }
    },
    [replyText, submittingReply, onComment],
  );

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      onDelete();
    } catch {
      toast.error('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  }, [deleting, onDelete]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border/50 bg-card p-4 md:p-5 shadow-xs"
    >
      {/* 头部：头像 + 昵称 + 时间 + 删除 */}
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0 ring-2 ring-background">
          <AvatarImage src={post.avatar} alt={post.nick} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {post.nick.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground truncate">
              {post.nick}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatRelativeTime(post.created)}
            </span>
          </div>

          {/* 文字内容 */}
          {post.content && (
            <p className="mt-2 text-sm text-foreground/90 leading-relaxed whitespace-pre-line break-words">
              {post.content}
            </p>
          )}

          {/* 图片网格 */}
          {post.images.length > 0 && (
            <div
              className={`mt-3 grid gap-2 ${
                post.images.length === 1
                  ? 'grid-cols-1'
                  : post.images.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
              }`}
            >
              {post.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onImageClick(idx)}
                  className={`relative overflow-hidden rounded-lg border border-border/30 bg-muted cursor-pointer group ${
                    post.images.length === 1 ? 'aspect-video max-h-80' : 'aspect-square'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`动态图片 ${idx + 1}`}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-200" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 删除按钮 */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            
         {/* 隐藏删除按键... */}
            
            // <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-destructive" aria-label="删除动态">
              // <Trash2 className="size-4" />
            // </Button> 


            
            {/* 原来删除按钮位置，用空div占位维持布局 */}
            <div className="size-8 shrink-0" />
            
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                删除后无法恢复，确定要删除这条动态吗？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? '删除中...' : '确认删除'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* 底部操作栏 */}
      <div className="mt-4 flex items-center gap-1 border-t border-border/30 pt-3">
        {/* 点赞 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (post.liked ? onUnlike() : onLike())}
          className={`gap-1.5 text-xs ${
            post.liked
              ? 'text-red-500 hover:text-red-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart
            className={`size-4 transition-transform duration-200 ${
              post.liked ? 'fill-current scale-110' : ''
            }`}
          />
          {post.like > 0 && <span>{post.like}</span>}
        </Button>

        {/* 评论 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments((v) => !v)}
          className={`gap-1.5 text-xs ${
            showComments ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageCircle className="size-4" />
          {post.replies.length > 0 && <span>{post.replies.length}</span>}
          {showComments ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </Button>
      </div>

      {/* 评论区 */}
      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3 border-t border-border/30 pt-3">
              {/* 仅【无评论+加载中/刚打开】才显示加载转圈 */}
              {(loadingComments || isFirstOpen) && post.replies.length === 0 && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">加载评论中...</span>
                </div>
              )}

              {/* 已有评论列表（打开直接渲染，不经过loading） */}
              {post.replies.length > 0 && (
                <div className="space-y-2.5">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2.5">
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={reply.avatar} alt={reply.nick} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                          {reply.nick.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {reply.nick}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(reply.created)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-foreground/80 leading-relaxed break-words">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 暂无评论（仅加载完成、无评论时渲染） */}
              {!loadingComments && !isFirstOpen && post.replies.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  暂无评论，来说点什么吧
                </p>
              )}

              {/* 评论输入框 */}
              <form onSubmit={handleReplySubmit} className="flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="写下你的评论..."
                  rows={2}
                  className="min-h-0 flex-1 resize-none text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyText.trim() || submittingReply}
                  className="shrink-0 self-end"
                >
                  {submittingReply ? (
                    <span className="flex items-center gap-1">
                      <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    </span>
                  ) : (
                    <Send className="size-3.5" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
