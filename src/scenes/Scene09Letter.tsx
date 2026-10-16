import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { useTypewriter } from '@/core/useTypewriter';
import { haptics } from '@/core/haptics';

interface Scene09LetterProps {
  onDone: () => void;
}

export default function Scene09Letter({ onDone }: Scene09LetterProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [psText, setPsText] = useState(false);
  const roseHoldRef = useRef<number | null>(null);

  const lines = CONTENT.letter.lines;
  const fullText = lines[lineIndex] ?? '';

  const { displayed, done, skip } = useTypewriter({
    text: fullText,
    speed: 30,
    startDelay: 200,
  });

  const handleAdvance = useCallback(() => {
    if (!done) {
      skip();
      return;
    }

    if (lineIndex < lines.length - 1) {
      haptics(10);
      setLineIndex((prev) => prev + 1);
    } else if (!showSignature) {
      haptics([30]);
      setShowSignature(true);
      setTimeout(() => setShowButton(true), 2000);
    }
  }, [done, skip, lineIndex, lines.length, showSignature]);

  // Mark all done when last line is done
  useEffect(() => {
    if (lineIndex === lines.length - 1 && done && !allDone) {
      setAllDone(true);
    }
  }, [lineIndex, done, lines.length, allDone]);

  // Rose hold easter egg
  const handleRosePointerDown = () => {
    roseHoldRef.current = window.setTimeout(() => {
      setPsText(true);
      haptics(20);
      setTimeout(() => setPsText(false), 4000);
    }, 2000);
  };

  const handleRosePointerUp = () => {
    if (roseHoldRef.current !== null) {
      clearTimeout(roseHoldRef.current);
      roseHoldRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (roseHoldRef.current !== null) clearTimeout(roseHoldRef.current);
    };
  }, []);

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFF8EE 0%, #FFE4EA 60%, #FFF5F7 100%)"
      scrollable
    >
      <div
        className="w-full max-w-sm"
        onPointerDown={handleAdvance}
        style={{ minHeight: '60vh' }}
      >
        {/* Letter paper */}
        <div
          className="relative bg-cream rounded-sticker shadow-soft-lg p-6 pb-8"
          style={{
            backgroundImage: 'linear-gradient(to bottom, transparent 31px, rgba(255,196,212,0.3) 32px)',
            backgroundSize: '100% 32px',
          }}
        >
          {/* Rose decoration */}
          <div
            className="absolute -top-3 -right-3 cursor-pointer"
            onPointerDown={handleRosePointerDown}
            onPointerUp={handleRosePointerUp}
            onPointerLeave={handleRosePointerUp}
            aria-label="Mawar dekorasi"
          >
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="20" r="12" fill="#F0537D" />
              <circle cx="25" cy="20" r="8" fill="#FF7A9A" />
              <circle cx="25" cy="20" r="4" fill="#FFC7D4" />
              <line x1="25" y1="32" x2="25" y2="48" stroke="#9DBF9E" strokeWidth="2" />
              <path d="M25 38 Q19 36 17 40" stroke="#9DBF9E" strokeWidth="2" fill="none" />
              <path d="M25 42 Q31 40 33 44" stroke="#9DBF9E" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* PS text easter egg */}
          <AnimatePresence>
            {psText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 left-2 bg-white rounded-xl shadow-soft px-3 py-1.5"
              >
                <p className="font-hand text-base text-rose-500">
                  P.S. Aku lebih suka manggil kamu Milea.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Letter content */}
          <div className="font-hand text-xl text-ink leading-relaxed space-y-2 min-h-[200px]">
            {lines.slice(0, lineIndex).map((line, i) => (
              <p key={i} className="leading-relaxed">{line}</p>
            ))}
            <p className="leading-relaxed">
              {displayed}
              {!done && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Signature */}
          <AnimatePresence>
            {showSignature && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-right"
              >
                <svg width="120" height="50" viewBox="0 0 120 50" fill="none">
                  <motion.path
                    d="M5 35 Q15 10 25 30 Q35 45 45 20 Q55 5 65 25 Q75 40 85 15 Q95 5 105 30 Q110 35 115 28"
                    stroke="#B8325A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                </svg>
                <p className="font-hand text-lg text-ink-soft mt-1">
                  {CONTENT.letter.signature}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tap hint */}
        {!showButton && (
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-4 text-center font-body text-xs text-rose-300"
          >
            {done && !showSignature ? 'Tap untuk tanda tangan' : !done ? 'Tap untuk cepatin' : ''}
          </motion.p>
        )}

        {/* Continue button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center"
            >
              <button
                onPointerDown={(e) => { e.stopPropagation(); haptics(20); onDone(); }}
                className="px-8 py-3 rounded-full bg-rose-500 text-white font-display text-base shadow-soft active:scale-90 transition-transform"
                aria-label="Lanjut"
              >
                Lanjut
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
