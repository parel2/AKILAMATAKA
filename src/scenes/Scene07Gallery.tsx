import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import Polaroid from '@/components/Polaroid';
import { CONTENT } from '@/data/content';
import { cardPhoto, galleryItems } from '@/data/photos';
import { useHoldPress } from '@/core/useHoldPress';
import { haptics } from '@/core/haptics';

interface Scene07GalleryProps {
  onDone: () => void;
}

export default function Scene07Gallery({ onDone }: Scene07GalleryProps) {
  const photos = galleryItems.length > 0
    ? galleryItems
    : cardPhoto
      ? [{ src: cardPhoto, caption: CONTENT.photoCaptions[0] }]
      : [{ src: '', caption: 'Cute tanpa usaha' }];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thrown, setThrown] = useState(false);
  const [released, setReleased] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const holdTexts = CONTENT.gallery.holdTexts;

  const onComplete = useCallback(() => {
    haptics([40, 30, 40]);
    setTimeout(() => onDone(), 600);
  }, [onDone]);

  const { progress, isHolding, bind } = useHoldPress({
    ms: 3000,
    onComplete,
    onRelease: () => {
      setReleased(true);
      setTimeout(() => setReleased(false), 1500);
    },
  });

  // Update hold text based on progress
  const currentHoldText = released
    ? CONTENT.gallery.releaseText
    : holdTexts[Math.min(Math.floor(progress * holdTexts.length), holdTexts.length - 1)];

  const handleDragEnd = useCallback((_e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const threshold = 80;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      setThrown(true);
      haptics(20);
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, photos.length - 1));
        setThrown(false);
      }, 500);
    }
  }, [photos.length]);

  return (
    <SceneShell>
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="font-display text-2xl text-ink text-center mb-8">
          {CONTENT.gallery.title}
        </h2>

        {/* Polaroid stack */}
        <div
          ref={containerRef}
          className="relative w-full flex items-center justify-center"
          style={{ minHeight: '320px' }}
        >
          <AnimatePresence>
            {currentIndex < photos.length - 1 && (
              <motion.div
                key={`under-${currentIndex + 1}`}
                className="absolute"
                style={{ rotate: `${(currentIndex + 1) * 3 - 5}deg`, y: 12 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              >
                <div className="bg-white rounded-sticker shadow-soft p-3 pb-12" style={{ width: '220px' }}>
                  <div className="w-full overflow-hidden rounded-2xl bg-rose-100" style={{ aspectRatio: '1' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {thrown ? (
              <motion.div
                key={`thrown-${currentIndex}`}
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 0, x: 200, y: -50, rotate: 30 }}
                transition={{ duration: 0.4 }}
                className="absolute"
              >
                <Polaroid
                  src={photos[currentIndex].src}
                  caption={photos[currentIndex].caption}
                  rotation={-3}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`active-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute"
              >
                <Polaroid
                  src={photos[currentIndex].src}
                  caption={photos[currentIndex].caption}
                  rotation={-2}
                  drag
                  dragConstraints={containerRef}
                  onDragEnd={handleDragEnd}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* All photos seen message */}
          {currentIndex >= photos.length - 1 && !thrown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-0 text-center"
            >
              <p className="font-hand text-base text-rose-400">
                Itu dia semua alasannya~
              </p>
            </motion.div>
          )}
        </div>

        {/* Photo counter */}
        <p className="mt-2 font-body text-xs text-rose-300">
          {currentIndex + 1} / {photos.length}
        </p>

        {/* Hold to continue button */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            <button
              {...bind}
              aria-label="Tahan untuk lanjut"
              className="relative px-10 py-4 rounded-full bg-rose-500 text-white font-display text-base shadow-soft overflow-hidden active:scale-95 transition-transform"
              style={{ touchAction: 'none' }}
            >
              Tahan untuk Lanjut
              {/* Progress ring */}
              {isHolding && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                    strokeDasharray={`${progress * 289} 289`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentHoldText + (isHolding ? '-h' : '-r') + released}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mt-3 font-hand text-lg ${released ? 'text-rose-400' : 'text-ink-soft'}`}
            >
              {currentHoldText}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </SceneShell>
  );
}
