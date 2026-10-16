import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';
import confetti from 'canvas-confetti';

interface Scene12SlideProps {
  onDone: () => void;
}

export default function Scene12Slide({ onDone }: Scene12SlideProps) {
  const [statusText, setStatusText] = useState(CONTENT.slide.instruction);
  const [completed, setCompleted] = useState(false);
  const x = useMotionValue(0);
  const trackWidthRef = useRef<number>(0);
  const transitionRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const lastHapticZoneRef = useRef<string>('');

  const handleDrag = useCallback(() => {
    const currentX = x.get();
    const max = trackWidthRef.current;
    if (max <= 0) return;
    const pct = currentX / max;

    // Resistance zones at 40% and 75%
    if (pct > 0.35 && pct < 0.5) {
      setStatusText(CONTENT.slide.resistText1);
      if (lastHapticZoneRef.current !== 'zone1') {
        lastHapticZoneRef.current = 'zone1';
        haptics(15);
      }
    } else if (pct > 0.7 && pct < 0.85) {
      setStatusText(CONTENT.slide.resistText2);
      if (lastHapticZoneRef.current !== 'zone2') {
        lastHapticZoneRef.current = 'zone2';
        haptics(15);
      }
    } else if (pct >= 0.95) {
      setStatusText(CONTENT.slide.openedText);
    } else {
      setStatusText(CONTENT.slide.instruction);
      lastHapticZoneRef.current = '';
    }
  }, [x]);

  const handleDragEnd = useCallback(() => {
    if (completedRef.current) return;
    const currentX = x.get();
    const max = trackWidthRef.current;
    const pct = currentX / max;

    if (pct >= 0.95) {
      // Completed
      completedRef.current = true;
      setCompleted(true);
      haptics([50, 30, 50]);
      x.set(max);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FFA3B8', '#FF7A9A', '#F0537D', '#FFC7D4'],
        scalar: 0.7,
      });

      transitionRef.current = window.setTimeout(() => {
        onDone();
      }, 1500);
    } else {
      // Snap back
      x.set(0);
      haptics(10);
      setStatusText('Yah, kelepasan. Coba lagi.');
      setTimeout(() => {
        if (!completedRef.current) setStatusText(CONTENT.slide.instruction);
      }, 1500);
    }
  }, [x, onDone]);

  useEffect(() => {
    const updateMax = () => {
      const track = document.getElementById('slide-track');
      if (track) {
        trackWidthRef.current = track.offsetWidth - 56; // knob width
      }
    };
    updateMax();
    window.addEventListener('resize', updateMax);
    return () => {
      window.removeEventListener('resize', updateMax);
      if (transitionRef.current !== null) clearTimeout(transitionRef.current);
    };
  }, []);

  // Heart pulse opacity for the lock
  const lockOpacity = useTransform(x, (v) => {
    const max = trackWidthRef.current;
    if (max <= 0) return 1;
    const pct = v / max;
    return Math.max(1 - pct, 0);
  });

  return (
    <SceneShell background="linear-gradient(170deg, #FFE4EA 0%, #FFF5F7 60%, #FFF8EE 100%)">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="font-display text-xl text-ink text-center mb-2">
          {CONTENT.slide.instruction}
        </h2>

        {/* Padlock icon */}
        <div className="relative mb-8">
          {!completed ? (
            <motion.svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: lockOpacity }}>
              {/* Lock body */}
              <rect x="20" y="35" width="40" height="35" rx="8" fill="#F0537D" />
              {/* Shackle */}
              <path d="M28 35 V25 C28 18 33 13 40 13 C47 13 52 18 52 25 V35" stroke="#F0537D" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Heart on lock */}
              <path d="M40 48 C40 48 33 43 33 39 C33 36 36 34 39 37 C39 37 40 38 40 38 C40 38 41 37 41 37 C44 34 47 36 47 39 C47 43 40 48 40 48z" fill="#FFF" />
            </motion.svg>
          ) : (
            <motion.svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Open lock body */}
              <rect x="20" y="35" width="40" height="35" rx="8" fill="#F0537D" />
              {/* Open shackle */}
              <motion.path
                d="M28 35 V25 C28 18 33 13 40 13 C47 13 52 18 52 25"
                stroke="#F0537D"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, rotate: -20 }}
                style={{ transformOrigin: '52px 25px' }}
                transition={{ duration: 0.6 }}
              />
              <path d="M40 48 C40 48 33 43 33 39 C33 36 36 34 39 37 C39 37 40 38 40 38 C40 38 41 37 41 37 C44 34 47 36 47 39 C47 43 40 48 40 48z" fill="#FFF" />
            </motion.svg>
          )}
        </div>

        {/* Status text */}
        <motion.p
          key={statusText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-hand text-lg text-rose-500 text-center mb-8 min-h-[28px]"
        >
          {statusText}
        </motion.p>

        {/* Slide track */}
        <div
          id="slide-track"
          className="relative w-full max-w-[280px] h-14 rounded-full bg-gradient-to-r from-rose-100 to-rose-200 shadow-inner overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          {/* Track text */}
          {!completed && (
            <p className="absolute inset-0 flex items-center justify-center font-display text-sm text-rose-400 pointer-events-none pl-8">
              {CONTENT.slide.instruction}
            </p>
          )}

          {/* Knob */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: trackWidthRef.current }}
            dragElastic={0.02}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="absolute top-1 left-1 w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-soft flex items-center justify-center cursor-grab active:cursor-grabbing"
            aria-label="Geser untuk membuka hati"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 21 C12 21 3 14 3 8.5 C3 5.5 5.5 3 8.5 3 C10 3 11.5 4 12 5.5 C12.5 4 14 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14 12 21 12 21z" />
            </svg>
          </motion.div>

          {/* Completed overlay */}
          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-rose-300 to-rose-500"
            >
              <p className="font-display text-sm text-white">
                {CONTENT.slide.openedText}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </SceneShell>
  );
}
