import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';
import confetti from 'canvas-confetti';

interface Scene01GiftProps {
  onDone: () => void;
}

export default function Scene01Gift({ onDone }: Scene01GiftProps) {
  const [taps, setTaps] = useState(0);
  const [opened, setOpened] = useState(false);
  const [shake, setShake] = useState(false);
  const transitionRef = useRef<number | null>(null);

  const handleTap = () => {
    if (opened) return;
    const newTaps = taps + 1;
    setTaps(newTaps);
    haptics(30);
    setShake(true);
    setTimeout(() => setShake(false), 400);

    if (newTaps >= 3) {
      setOpened(true);
      haptics([40, 30, 40]);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFA3B8', '#FF7A9A', '#F0537D', '#FFC7D4'],
        scalar: 0.8,
      });

      transitionRef.current = window.setTimeout(() => {
        onDone();
      }, 1800);
    }
  };

  const currentText = opened
    ? CONTENT.gift.opened
    : taps === 0
      ? CONTENT.gift.initial
      : taps === 1
        ? CONTENT.gift.tap1
        : CONTENT.gift.tap2;

  return (
    <SceneShell>
      <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: '60vh' }}>
        <motion.div
          animate={
            shake
              ? { x: [-8, 8, -6, 6, 0], rotate: [-2, 2, -1, 1, 0] }
              : opened
                ? { scale: [1, 1.2, 1], y: [0, -15, 0] }
                : { rotate: [-1, 1, -1] }
          }
          transition={
            shake
              ? { duration: 0.4 }
              : opened
                ? { duration: 0.6 }
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }
          className="mb-8 cursor-pointer"
          onPointerDown={handleTap}
        >
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            {/* Box body */}
            <rect x="40" y="60" width="100" height="90" rx="12" fill="#FFC7D4" stroke="#FF7A9A" strokeWidth="3" />
            <rect x="40" y="60" width="100" height="30" rx="12" fill="#FFA3B8" stroke="#FF7A9A" strokeWidth="3" />

            {/* Vertical ribbon */}
            <rect x="82" y="60" width="16" height="90" fill="#F0537D" />

            {/* Lid (opens on tap 3) */}
            <motion.rect
              x="32" y="50" width="116" height="20" rx="10"
              fill="#FFA3B8" stroke="#FF7A9A" strokeWidth="3"
              animate={opened ? { y: 50, rotate: -25, x: 32 - 30, opacity: 0 } : { y: 50 }}
              transition={{ duration: 0.5 }}
            />

            {/* Bow */}
            <motion.g
              animate={opened ? { opacity: 0, y: -20, scale: 0.5 } : {}}
              transition={{ duration: 0.4 }}
            >
              <ellipse cx="72" cy="48" rx="18" ry="12" fill="#F0537D" />
              <ellipse cx="108" cy="48" rx="18" ry="12" fill="#F0537D" />
              <ellipse cx="72" cy="48" rx="10" ry="6" fill="#FF7A9A" />
              <ellipse cx="108" cy="48" rx="10" ry="6" fill="#FF7A9A" />
              <circle cx="90" cy="48" r="8" fill="#F0537D" />
              <circle cx="90" cy="48" r="4" fill="#FFE4EA" />
            </motion.g>

            {/* Inside peek when opened */}
            <AnimatePresence>
              {opened && (
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <path d="M70 90 Q90 70 110 90 Q90 110 70 90z" fill="#FFF" opacity="0.8" />
                  <text x="90" y="120" textAnchor="middle" fontSize="14" fill="#F0537D" fontFamily="Fredoka">
                    ♥
                  </text>
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={currentText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="font-hand text-2xl text-ink text-center px-6"
          >
            {currentText}
          </motion.p>
        </AnimatePresence>

        {!opened && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-6 font-body text-sm text-rose-400"
          >
            Ketuk pitanya {3 - taps}x lagi
          </motion.p>
        )}
      </div>
    </SceneShell>
  );
}
