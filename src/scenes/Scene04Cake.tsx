import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';
import confetti from 'canvas-confetti';

interface Scene04CakeProps {
  onDone: () => void;
}

interface Candle {
  id: number;
  swipes: number;
  lit: boolean;
  flameAngle: number;
  flameScale: number;
}

export default function Scene04Cake({ onDone }: Scene04CakeProps) {
  const [candles, setCandles] = useState<Candle[]>([
    { id: 0, swipes: 0, lit: true, flameAngle: 0, flameScale: 1 },
    { id: 1, swipes: 0, lit: true, flameAngle: 0, flameScale: 1 },
  ]);
  const [allOut, setAllOut] = useState(false);
  const [showWish, setShowWish] = useState(false);
  const [titleTaps, setTitleTaps] = useState(0);
  const [starBurst, setStarBurst] = useState(false);
  const titleTapTimerRef = useRef<number | null>(null);
  const lastSwipeRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    return () => {
      if (titleTapTimerRef.current !== null) clearTimeout(titleTapTimerRef.current);
    };
  }, []);

  const handleTitleTap = () => {
    const newTaps = titleTaps + 1;
    setTitleTaps(newTaps);
    if (titleTapTimerRef.current !== null) clearTimeout(titleTapTimerRef.current);
    titleTapTimerRef.current = window.setTimeout(() => setTitleTaps(0), 1500);

    if (newTaps >= 3) {
      setStarBurst(true);
      haptics([20, 20]);
      confetti({
        particleCount: 40,
        spread: 360,
        origin: { y: 0.3 },
        colors: ['#FFD56B', '#FFA3B8', '#F0537D'],
        shapes: ['star'],
        scalar: 0.7,
      });
      setTimeout(() => setStarBurst(false), 2000);
      setTitleTaps(0);
    }
  };

  const handleSwipe = useCallback((e: React.PointerEvent) => {
    if (allOut) return;
    const now = performance.now();
    const last = lastSwipeRef.current;
    lastSwipeRef.current = { x: e.clientX, y: e.clientY, time: now };

    if (!last) return;

    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = dist / Math.max(now - last.time, 1);

    // Determine which candle based on x position relative to center
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const candleWidth = rect.width / 2;
    const candleIndex = relX < candleWidth ? 0 : 1;

    setCandles((prev) => {
      const candle = prev[candleIndex];
      if (!candle.lit) return prev;

      const flameAngle = Math.sign(dx) * Math.min(speed * 10, 30);
      const newSwipes = candle.swipes + 1;

      if (newSwipes >= 2) {
        haptics([30]);
        const updated = [...prev];
        updated[candleIndex] = {
          ...candle,
          lit: false,
          flameAngle: 0,
          flameScale: 0,
          swipes: newSwipes,
        };

        const allLit = updated.every((c) => !c.lit);
        if (allLit) {
          setAllOut(true);
          setTimeout(() => {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.5 },
              colors: ['#FFA3B8', '#FF7A9A', '#F0537D', '#FFD56B'],
              scalar: 0.8,
            });
            haptics([40, 30, 40]);
            setTimeout(() => setShowWish(true), 800);
          }, 500);
        }
        return updated;
      } else {
        haptics(15);
        const updated = [...prev];
        updated[candleIndex] = {
          ...candle,
          flameAngle,
          flameScale: Math.max(1 - speed * 0.05, 0.5),
          swipes: newSwipes,
        };
        return updated;
      }
    });
  }, [allOut]);

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFF8EE 0%, #FFE4EA 50%, #FFC7D4 100%)"
    >
      <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: '60vh' }}>
        <motion.h2
          onClick={handleTitleTap}
          className="font-display text-3xl text-ink text-center mb-2 cursor-pointer"
        >
          {CONTENT.cake.title}
        </motion.h2>
        <p className="font-body text-sm text-ink-soft text-center mb-8">
          {CONTENT.cake.subtitle}
        </p>

        {/* Cake with candles */}
        <div
          className="relative w-64 mb-8"
          onPointerMove={handleSwipe}
          style={{ touchAction: 'none' }}
        >
          <svg width="256" height="200" viewBox="0 0 256 200" fill="none">
            {/* Cake body */}
            <rect x="48" y="100" width="160" height="80" rx="12" fill="#FFDFE7" stroke="#FFA3B8" strokeWidth="3" />
            <rect x="48" y="90" width="160" height="20" rx="10" fill="#FFC7D4" stroke="#FFA3B8" strokeWidth="3" />
            {/* Frosting drips */}
            <path d="M58 110 Q62 118 66 110 Q70 120 74 110 Q78 118 82 110" stroke="#FF7A9A" strokeWidth="3" fill="none" />
            <path d="M88 110 Q92 120 96 110 Q100 118 104 110 Q108 120 112 110" stroke="#FF7A9A" strokeWidth="3" fill="none" />
            <path d="M118 110 Q122 118 126 110 Q130 120 134 110 Q138 118 142 110" stroke="#FF7A9A" strokeWidth="3" fill="none" />
            <path d="M148 110 Q152 120 156 110 Q160 118 164 110 Q168 120 172 110" stroke="#FF7A9A" strokeWidth="3" fill="none" />
            <path d="M178 110 Q182 118 186 110 Q190 120 194 110 Q198 118 202 110" stroke="#FF7A9A" strokeWidth="3" fill="none" />
            {/* Decorations */}
            <circle cx="80" cy="140" r="4" fill="#F0537D" />
            <circle cx="128" cy="145" r="4" fill="#FFD56B" />
            <circle cx="176" cy="140" r="4" fill="#F0537D" />
            <circle cx="100" cy="160" r="3" fill="#9DBF9E" />
            <circle cx="156" cy="160" r="3" fill="#9DBF9E" />

            {/* Candle 1 (digit 2) */}
            <g>
              <rect x="80" y="55" width="14" height="45" rx="3" fill="#FF7A9A" />
              <rect x="80" y="55" width="14" height="8" rx="2" fill="#FFC7D4" />
              <text x="87" y="85" textAnchor="middle" fontSize="18" fill="#FFF" fontFamily="Fredoka" fontWeight="700">2</text>
              {/* Wick */}
              <line x1="87" y1="50" x2="87" y2="55" stroke="#5A2A3C" strokeWidth="2" />
              {/* Flame */}
              {candles[0].lit && (
                <motion.g
                  animate={{
                    rotate: candles[0].flameAngle,
                    scale: candles[0].flameScale,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ transformOrigin: '87px 50px' }}
                >
                  <ellipse cx="87" cy="44" rx="5" ry="9" fill="#FF6B35" opacity="0.9" />
                  <ellipse cx="87" cy="46" rx="3" ry="6" fill="#FFD56B" />
                  <ellipse cx="87" cy="48" rx="1.5" ry="3" fill="#FFF8E0" />
                </motion.g>
              )}
              {/* Smoke when out */}
              {!candles[0].lit && (
                <motion.g
                  initial={{ opacity: 0.6, y: 50 }}
                  animate={{ opacity: 0, y: 30 }}
                  transition={{ duration: 1.5 }}
                >
                  <circle cx="87" cy="40" r="4" fill="#D4D4D4" opacity="0.4" />
                  <circle cx="84" cy="35" r="3" fill="#D4D4D4" opacity="0.3" />
                </motion.g>
              )}
            </g>

            {/* Candle 2 (digit 6) */}
            <g>
              <rect x="162" y="55" width="14" height="45" rx="3" fill="#FF7A9A" />
              <rect x="162" y="55" width="14" height="8" rx="2" fill="#FFC7D4" />
              <text x="169" y="85" textAnchor="middle" fontSize="18" fill="#FFF" fontFamily="Fredoka" fontWeight="700">6</text>
              <line x1="169" y1="50" x2="169" y2="55" stroke="#5A2A3C" strokeWidth="2" />
              {candles[1].lit && (
                <motion.g
                  animate={{
                    rotate: candles[1].flameAngle,
                    scale: candles[1].flameScale,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ transformOrigin: '169px 50px' }}
                >
                  <ellipse cx="169" cy="44" rx="5" ry="9" fill="#FF6B35" opacity="0.9" />
                  <ellipse cx="169" cy="46" rx="3" ry="6" fill="#FFD56B" />
                  <ellipse cx="169" cy="48" rx="1.5" ry="3" fill="#FFF8E0" />
                </motion.g>
              )}
              {!candles[1].lit && (
                <motion.g
                  initial={{ opacity: 0.6, y: 50 }}
                  animate={{ opacity: 0, y: 30 }}
                  transition={{ duration: 1.5 }}
                >
                  <circle cx="169" cy="40" r="4" fill="#D4D4D4" opacity="0.4" />
                  <circle cx="172" cy="35" r="3" fill="#D4D4D4" opacity="0.3" />
                </motion.g>
              )}
            </g>
          </svg>
        </div>

        {!allOut && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-body text-sm text-rose-400 text-center px-6"
          >
            {CONTENT.cake.blowInstruction}
          </motion.p>
        )}

        <AnimatePresence>
          {showWish && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex flex-col items-center"
            >
              <p className="font-hand text-xl text-ink text-center px-8 mb-6 max-w-xs">
                {CONTENT.cake.wishText}
              </p>
              <button
                onPointerDown={() => { haptics(20); onDone(); }}
                className="px-8 py-3 rounded-full bg-rose-500 text-white font-display text-base shadow-soft active:scale-90 transition-transform"
                aria-label={CONTENT.cake.continueButton}
              >
                {CONTENT.cake.continueButton}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {starBurst && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 pointer-events-none z-40"
          />
        )}
      </div>
    </SceneShell>
  );
}
