import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';
import confetti from 'canvas-confetti';

interface Scene08FillHeartProps {
  onDone: () => void;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  value: string;
}

export default function Scene08FillHeart({ onDone }: Scene08FillHeartProps) {
  const [fill, setFill] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [stage, setStage] = useState(0);
  const [full, setFull] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const fillRef = useRef(0);
  const decayRafRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const zeroSinceRef = useRef<number | null>(null);
  const sparkIdRef = useRef(0);
  const fullRef = useRef(false);

  const stageTexts = CONTENT.fillheart.stageTexts;

  const stopDecay = useCallback(() => {
    if (decayRafRef.current !== null) {
      cancelAnimationFrame(decayRafRef.current);
      decayRafRef.current = null;
    }
  }, []);

  // Decay loop
  useEffect(() => {
    const tick = () => {
      setFill((prev) => {
        if (fullRef.current) return prev;
        const now = performance.now();
        const timeSinceTap = now - lastTapRef.current;

        // Only decay after 500ms of no tapping
        if (timeSinceTap > 500 && prev > 0) {
          const newFill = Math.max(prev - 0.3, 0);
          fillRef.current = newFill;

          if (newFill <= 0 && zeroSinceRef.current === null) {
            zeroSinceRef.current = now;
          } else if (newFill > 0) {
            zeroSinceRef.current = null;
          }

          // Anti-frustration: if at 0 for >5s, give bonus
          if (newFill <= 0 && zeroSinceRef.current !== null && now - zeroSinceRef.current > 5000) {
            zeroSinceRef.current = now;
            haptics([30]);
            return 15;
          }

          // Update stage
          const newStage = Math.min(Math.floor(newFill / 25), 3);
          setStage(newStage);

          return newFill;
        }
        return prev;
      });
      decayRafRef.current = requestAnimationFrame(tick);
    };
    decayRafRef.current = requestAnimationFrame(tick);

    return () => stopDecay();
  }, [stopDecay]);

  const handleTap = (e: React.PointerEvent) => {
    if (fullRef.current) return;
    e.preventDefault();
    haptics(12);
    lastTapRef.current = performance.now();
    zeroSinceRef.current = null;

    const newFill = Math.min(fillRef.current + 4, 100);
    fillRef.current = newFill;
    setFill(newFill);

    const newStage = Math.min(Math.floor(newFill / 25), 3);
    if (newStage !== stage) {
      setStage(newStage);
      haptics([20]);
    }

    // Spawn spark at tap location
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = sparkIdRef.current++;
    setSparks((prev) => [...prev, { id, x, y, value: '+4%' }].slice(-8));

    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== id));
    }, 800);

    if (newFill >= 100 && !fullRef.current) {
      fullRef.current = true;
      setFull(true);
      haptics([50, 30, 50, 30]);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#F0537D', '#FF7A9A', '#FFA3B8', '#FFC7D4'],
        shapes: ['circle'],
        scalar: 0.8,
      });
      setTimeout(() => setShowButton(true), 1000);
    }
  };

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFE4EA 0%, #FFF5F7 50%, #FFF8EE 100%)"
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="font-display text-2xl text-ink text-center mb-2">
          {CONTENT.fillheart.title}
        </h2>
        <p className="font-body text-sm text-rose-400 text-center mb-8">
          {CONTENT.fillheart.instruction}
        </p>

        {/* Heart glass */}
        <div
          className="relative cursor-pointer"
          onPointerDown={handleTap}
          style={{ touchAction: 'none', width: '200px', height: '200px' }}
          aria-label="Ketuk hati untuk mengisi"
        >
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            {/* Heart outline */}
            <path
              d="M100 180 C100 180 20 120 20 70 C20 45 40 25 65 25 C80 25 95 35 100 50 C105 35 120 25 135 25 C160 25 180 45 180 70 C180 120 100 180 100 180z"
              fill="none"
              stroke="#FFC7D4"
              strokeWidth="4"
            />
            {/* Glass clip */}
            <defs>
              <clipPath id="heart-clip">
                <path d="M100 180 C100 180 20 120 20 70 C20 45 40 25 65 25 C80 25 95 35 100 50 C105 35 120 25 135 25 C160 25 180 45 180 70 C180 120 100 180 100 180z" />
              </clipPath>
            </defs>
            {/* Fill liquid */}
            <g clipPath="url(#heart-clip)">
              <motion.rect
                x="0"
                y={200 - (fill / 100) * 200}
                width="200"
                height="200"
                fill="url(#fill-gradient)"
                animate={{ y: 200 - (fill / 100) * 200 }}
                transition={{ duration: 0.1 }}
              />
              {/* Wavy surface */}
              <motion.path
                d="M0,0 Q25,-5 50,0 T100,0 T150,0 T200,0 L200,10 L0,10z"
                fill="#FF7A9A"
                animate={{ x: [0, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ offset: `0 ${200 - (fill / 100) * 200 - 5}px` }}
                transform={`translate(0, ${200 - (fill / 100) * 200 - 5})`}
              />
            </g>
            <defs>
              <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7A9A" />
                <stop offset="100%" stopColor="#F0537D" />
              </linearGradient>
            </defs>
          </svg>

          {/* Sparks */}
          {sparks.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -40, scale: 0.5 }}
              transition={{ duration: 0.8 }}
              className="absolute pointer-events-none font-display text-sm text-rose-500 font-bold"
              style={{ left: s.x, top: s.y }}
            >
              {s.value}
            </motion.div>
          ))}

          {/* Percentage */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-display text-2xl font-bold text-white drop-shadow">
              {Math.round(fill)}%
            </span>
          </div>
        </div>

        {/* Motivation text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stage + (full ? '-full' : '')}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-6 font-hand text-xl text-rose-500 text-center"
          >
            {full ? stageTexts[3] : stageTexts[stage]}
          </motion.p>
        </AnimatePresence>

        {/* Continue button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onPointerDown={() => { haptics(20); onDone(); }}
              className="mt-6 px-8 py-3 rounded-full bg-rose-500 text-white font-display text-base shadow-soft active:scale-90 transition-transform"
              aria-label="Lanjut"
            >
              Lanjut
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
