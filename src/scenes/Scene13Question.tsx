import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import Mascot, { type MascotExpression } from '@/components/Mascot';
import { CONTENT } from '@/data/content';
import { useRunaway } from '@/core/useRunaway';
import { haptics } from '@/core/haptics';

interface Scene13QuestionProps {
  onDone: () => void;
}

function getMascotExpression(escapes: number): MascotExpression {
  if (escapes <= 1) return 'idle';
  if (escapes <= 3) return 'curious';
  if (escapes <= 6) return 'panik';
  return 'sedih';
}

export default function Scene13Question({ onDone }: Scene13QuestionProps) {
  const [showError, setShowError] = useState(false);
  const [noGone, setNoGone] = useState(false);
  const [yesScale, setYesScale] = useState(1);
  const [waiting, setWaiting] = useState(false);
  const lastInteractionRef = useRef<number>(performance.now());
  const waitingTimerRef = useRef<number | null>(null);

  const handleEscape = useCallback((count: number) => {
    setYesScale(Math.min(1 + count * 0.1, 1.8));

    if (count === 3) {
      setShowError(true);
    }

    if (count >= 8) {
      setNoGone(true);
    }
  }, []);

  const runaway = useRunaway(CONTENT.question.runawayTexts, {
    margin: 60,
    maxEscapes: 8,
    onEscape: handleEscape,
  });

  // Waiting detection (12s of no interaction)
  useEffect(() => {
    const updateInteraction = () => {
      lastInteractionRef.current = performance.now();
      setWaiting(false);
    };

    window.addEventListener('pointerdown', updateInteraction);
    window.addEventListener('pointermove', updateInteraction);

    waitingTimerRef.current = window.setInterval(() => {
      const idle = performance.now() - lastInteractionRef.current;
      if (idle > 12000 && !runaway.visible === false && !noGone) {
        setWaiting(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('pointerdown', updateInteraction);
      window.removeEventListener('pointermove', updateInteraction);
      if (waitingTimerRef.current !== null) clearInterval(waitingTimerRef.current);
    };
  }, [noGone, runaway.visible]);

  const handleYes = useCallback(() => {
    haptics([60, 40, 60, 40, 60]);
    onDone();
  }, [onDone]);

  const mascotExpression = getMascotExpression(runaway.escapes);
  const noButtonText = runaway.escapes >= 6
    ? CONTENT.question.runawayTransform
    : runaway.text;

  return (
    <SceneShell background="linear-gradient(170deg, #FFF5F7 0%, #FFE4EA 50%, #FFC7D4 100%)">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Mascot */}
        <Mascot expression={mascotExpression} size={100} />

        {/* Question text */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl text-ink text-center mt-4 mb-12 px-4 leading-tight"
        >
          {CONTENT.question.text}
        </motion.h1>

        {/* Buttons area */}
        <div className="relative w-full flex flex-col items-center gap-6">
          {/* Yes button */}
          <div className="relative">
            {/* Pulsing hearts around yes button */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  top: `${-20 + i * 10}px`,
                  left: `${-30 + i * 50}px`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#F0537D">
                  <path d="M12 21 C12 21 3 14 3 8.5 C3 5.5 5.5 3 8.5 3 C10 3 11.5 4 12 5.5 C12.5 4 14 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14 12 21 12 21z" />
                </svg>
              </motion.div>
            ))}

            <motion.button
              animate={{ scale: [yesScale, yesScale * 1.03, yesScale] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              onPointerDown={handleYes}
              aria-label={CONTENT.question.yes}
              className="px-12 py-4 rounded-full bg-rose-500 text-white font-display text-xl shadow-soft-lg active:scale-90 transition-transform"
              style={{ transform: `scale(${yesScale})` }}
            >
              {CONTENT.question.yes}
            </motion.button>
          </div>

          {/* No button (runaway) */}
          <AnimatePresence>
            {!noGone && runaway.visible && (
              <motion.button
                animate={{ x: runaway.x, y: runaway.y, scale: runaway.scale }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                {...runaway.bind}
                aria-label={CONTENT.question.no}
                className="px-8 py-3 rounded-full bg-white text-rose-500 font-display text-base border-2 border-rose-200 shadow-soft"
                style={{ touchAction: 'none' }}
              >
                {noButtonText}
              </motion.button>
            )}
          </AnimatePresence>

          {/* No choice message */}
          {noGone && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-hand text-xl text-rose-500 text-center"
            >
              {CONTENT.question.noChoiceText}
            </motion.p>
          )}
        </div>

        {/* Waiting text */}
        <AnimatePresence>
          {waiting && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 font-hand text-lg text-ink-soft"
            >
              {CONTENT.question.waitingText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Error 404 popup */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-soft-lg p-6 max-w-[280px] text-center"
            >
              <div className="mb-3 text-4xl">
                <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto" fill="none">
                  <circle cx="24" cy="24" r="20" fill="#FFF5F7" stroke="#FFA3B8" strokeWidth="2" />
                  <text x="24" y="22" textAnchor="middle" fontSize="10" fill="#F0537D" fontFamily="monospace">404</text>
                  <path d="M16 30 Q24 34 32 30" stroke="#F0537D" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-body text-sm text-ink mb-4">
                {CONTENT.question.error404}
              </p>
              <button
                onPointerDown={(e) => { e.stopPropagation(); setShowError(false); haptics(10); }}
                className="px-8 py-2.5 rounded-full bg-rose-500 text-white font-display text-sm active:scale-90"
                aria-label={CONTENT.question.errorButton}
              >
                {CONTENT.question.errorButton}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneShell>
  );
}
