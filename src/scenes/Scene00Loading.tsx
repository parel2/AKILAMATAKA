import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import Mascot from '@/components/Mascot';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';

interface Scene00LoadingProps {
  onDone: () => void;
}

export default function Scene00Loading({ onDone }: Scene00LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [jumping, setJumping] = useState(false);
  const tappedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    const duration = 3000; // 3s to reach 99%

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const p = Math.min((elapsed / duration) * 99, 99);
      setProgress(p);

      if (p >= 99) {
        setStuck(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CONTENT.loadingMessages.length);
    }, 1200);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearInterval(messageTimer);
    };
  }, []);

  const handleTap = () => {
    if (tappedRef.current) return;
    tappedRef.current = true;
    setStuck(false);
    setProgress(100);
    setJumping(true);
    haptics([30, 20, 30]);

    setTimeout(() => {
      onDone();
    }, 800);
  };

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFF8EE 0%, #FFE4EA 60%, #FFF5F7 100%)"
    >
      <div
        className="flex flex-col items-center justify-center w-full"
        onPointerDown={handleTap}
        style={{ minHeight: '60vh' }}
      >
        <motion.div
          animate={jumping ? { y: [0, -30, 0], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Mascot expression="idle" size={110} floating={!jumping} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stuck ? 'stuck' : messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="font-body text-base text-ink text-center mb-6 px-4"
          >
            {stuck ? CONTENT.loadingStuck : CONTENT.loadingMessages[messageIndex]}
          </motion.p>
        </AnimatePresence>

        <div className="w-64 h-5 bg-rose-100 rounded-full overflow-hidden border-2 border-white shadow-soft">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-300 to-rose-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <p className="mt-2 font-display text-sm text-rose-400">
          {Math.round(progress)}%
        </p>

        {stuck && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-6 font-hand text-xl text-rose-500"
          >
            sentuh di mana pun ya~
          </motion.p>
        )}
      </div>
    </SceneShell>
  );
}
