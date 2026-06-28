import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

interface ImagePreviewProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export default memo(function ImagePreview({
  images,
  initialIndex,
  open,
  onClose,
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, initialIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    },
    [onClose, goPrev, goNext],
  );

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* 关闭按钮 */}
          <Button
            size="icon"
            variant="ghost"
            className="!absolute right-4 top-4 z-10 h-10 w-10 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="关闭预览"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* 图片计数 */}
          {images.length > 1 && (
            <div className="!absolute left-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1 text-sm text-white/80 backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 左箭头 */}
          {images.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              className="!absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="上一张"
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>
          )}

          {/* 右箭头 */}
          {images.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              className="!absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="下一张"
            >
              <ChevronRight className="h-7 w-7" />
            </Button>
          )}

          {/* 图片 */}
          <motion.div
            key={currentIndex}
            className="flex items-center justify-center max-w-[90vw] max-h-[85vh]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[currentIndex]}
              alt={`预览图片 ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
          </motion.div>

          {/* 底部缩略图导航 */}
          {images.length > 1 && (
            <div className="!absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`查看第 ${idx + 1} 张图片`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
