import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import PhotoOrPlaceholder from '@/components/PhotoOrPlaceholder';
import { CONTENT } from '@/data/content';
import { togetherPhoto } from '@/data/photos';
import { haptics } from '@/core/haptics';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

interface Scene10PhotoProps {
  onDone: () => void;
}

export default function Scene10Photo({ onDone }: Scene10PhotoProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [showButton, setShowButton] = useState(false);
  const heartIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parallax motion values
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 150, damping: 20 });
  const sy = useSpring(py, { stiffness: 150, damping: 20 });
  const rotX = useTransform(sy, [-50, 50], [5, -5]);
  const rotY = useTransform(sx, [-50, 50], [-5, 5]);
  const translateX = useTransform(sx, [-50, 50], [-12, 12]);
  const translateY = useTransform(sy, [-50, 50], [-12, 12]);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    px.set(Math.max(-50, Math.min(50, e.clientX - cx)));
    py.set(Math.max(-50, Math.min(50, e.clientY - cy)));
  }, [px, py]);

  const handlePhotoTap = useCallback((e: React.PointerEvent) => {
    haptics(10);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = heartIdRef.current++;
    setHearts((prev) => [...prev, { id, x, y }].slice(-8));
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1500);
  }, []);

  return (
    <SceneShell background="linear-gradient(170deg, #FFE4EA 0%, #FFF8EE 50%, #FFF5F7 100%)">
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Photo frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            rotateX: rotX,
            rotateY: rotY,
            x: translateX,
            y: translateY,
            transformPerspective: 800,
          }}
          className="relative bg-white rounded-sticker shadow-soft-lg p-4 pb-16"
          onPointerDown={handlePhotoTap}
        >
          {/* Ribbon decoration */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <path d="M20 25 L8 8 L8 20z" fill="#F0537D" />
              <path d="M20 25 L32 8 L32 20z" fill="#F0537D" />
              <circle cx="20" cy="18" r="5" fill="#F0537D" />
              <circle cx="20" cy="18" r="2.5" fill="#FFE4EA" />
            </svg>
          </div>

          {/* Star decorations */}
          <svg className="absolute -top-3 -left-3 z-20" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L14 8 L20 9 L15 13 L17 19 L12 16 L7 19 L9 13 L4 9 L10 8z" fill="#FFD56B" />
          </svg>
          <svg className="absolute -bottom-3 -right-3 z-20" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L14 8 L20 9 L15 13 L17 19 L12 16 L7 19 L9 13 L4 9 L10 8z" fill="#FFA3B8" />
          </svg>

          {/* Photo */}
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ aspectRatio: '1' }}
          >
            <PhotoOrPlaceholder
              src={togetherPhoto ?? ''}
              alt="Foto bareng"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Caption */}
          <p className="absolute bottom-4 left-0 right-0 text-center font-hand text-lg text-ink px-4">
            {CONTENT.togetherPhotoCaption}
          </p>

          {/* Floating hearts on tap */}
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -60, scale: 1.2 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute pointer-events-none z-30"
              style={{ left: h.x, top: h.y }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#F0537D">
                <path d="M12 21 C12 21 3 14 3 8.5 C3 5.5 5.5 3 8.5 3 C10 3 11.5 4 12 5.5 C12.5 4 14 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14 12 21 12 21z" />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* Bridge text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 font-hand text-xl text-ink text-center px-6 max-w-xs"
        >
          Dari semua foto, ada satu yang paling aku tunggu.
        </motion.p>

        {/* Continue button */}
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onPointerDown={() => { haptics(20); onDone(); }}
            className="mt-6 px-8 py-3 rounded-full bg-rose-500 text-white font-display text-base shadow-soft active:scale-90 transition-transform"
            aria-label="Lanjut"
          >
            Lanjut
          </motion.button>
        )}
      </div>
    </SceneShell>
  );
}
