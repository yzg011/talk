import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Image as ImageIcon, X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';

interface PublishSectionProps {
  onPublish: (content: string, images: File[]) => Promise<void>;
}

export default function PublishSection({ onPublish }: PublishSectionProps) {
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    let loaded = 0;
    let validCount = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('仅支持图片文件');
        loaded++;
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过 10MB');
        loaded++;
        return;
      }

      validCount++;
      const reader = new FileReader();
      reader.onload = () => {
        newFiles.push(file);
        newPreviews.push(reader.result as string);
        loaded++;
        if (loaded === files.length) {
          setImageFiles((prev) => [...prev, ...newFiles].slice(0, 9));
          setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 9));
        }
      };
      reader.onerror = () => {
        loaded++;
        toast.error('图片读取失败');
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed && imageFiles.length === 0) {
      toast.error('请输入内容或添加图片');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPublish(trimmed, imageFiles);
      setContent('');
      setImageFiles([]);
      setImagePreviews([]);
      toast.success('发布成功');
    } catch (err) {
      toast.error('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-xs transition-shadow hover:shadow-sm">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法..."
          className="min-h-[100px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          disabled={isSubmitting}
        />

        {imagePreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imagePreviews.map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border/40">
                <Image
                  src={img}
                  alt={`图片 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="!absolute right-1 top-1 z-20 h-6 w-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  onClick={() => removeImage(i)}
                  aria-label="移除图片"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || imageFiles.length >= 9}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs">图片</span>
            </Button>
            {imageFiles.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {imageFiles.length}/9
              </span>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            className="h-8 gap-1.5 rounded-full px-4"
            disabled={isSubmitting || (!content.trim() && imageFiles.length === 0)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-xs">发布中</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span className="text-xs">发布</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
