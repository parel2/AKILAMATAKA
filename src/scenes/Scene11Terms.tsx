import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';

interface Scene11TermsProps {
  onDone: () => void;
}

export default function Scene11Terms({ onDone }: Scene11TermsProps) {
  const [reachedBottom, setReachedBottom] = useState(false);
  const [shake, setShake] = useState(false);
  const [showShakeText, setShowShakeText] = useState(false);
  const [stamped, setStamped] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const transitionRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setReachedBottom(true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (transitionRef.current !== null) clearTimeout(transitionRef.current);
      if (shakeTimerRef.current !== null) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const handleAgreeAttempt = useCallback(() => {
    if (stamped) return;

    if (!reachedBottom) {
      setShake(true);
      setShowShakeText(true);
      haptics([20, 20]);
      if (shakeTimerRef.current !== null) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => {
        setShake(false);
        setShowShakeText(false);
      }, 1500);
      return;
    }

    // Stamped
    setStamped(true);
    haptics([40, 30, 40]);
    transitionRef.current = window.setTimeout(() => {
      onDone();
    }, 1400);
  }, [reachedBottom, stamped, onDone]);

  return (
    <SceneShell background="linear-gradient(170deg, #FFF5F7 0%, #FFE4EA 100%)">
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2 className="font-display text-xl text-ink text-center mb-4 px-4">
          {CONTENT.terms.title}
        </h2>

        {/* Scrollable terms box */}
        <div
          ref={scrollRef}
          className="relative w-full bg-white/80 backdrop-blur-sm rounded-sticker shadow-soft p-5 overflow-y-auto scrollable border-2 border-rose-100"
          style={{ maxHeight: '50vh', touchAction: 'pan-y' }}
        >
          <div className="space-y-3">
            {CONTENT.terms.clauses.map((clause, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2"
              >
                <span className="font-display text-sm text-rose-500 font-bold flex-shrink-0">
                  {i + 1}.
                </span>
                <p className="font-body text-sm text-ink leading-relaxed">
                  {clause}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Sentinel for bottom detection */}
          <div ref={sentinelRef} className="h-1 w-full" />

          {/* Stamp overlay */}
          <AnimatePresence>
            {stamped && (
              <motion.div
                initial={{ scale: 4, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="border-4 rounded-xl px-6 py-2"
                  style={{ borderColor: '#F0537D', borderWidth: '4px' }}
                >
                  <span className="font-display text-3xl font-bold text-rose-500 opacity-80">
                    {CONTENT.terms.stamp}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shake text */}
        <AnimatePresence>
          {showShakeText && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 font-hand text-base text-rose-400"
            >
              {CONTENT.terms.notReadyText}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Agree button */}
        <motion.button
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          onPointerDown={handleAgreeAttempt}
          disabled={stamped}
          aria-label={CONTENT.terms.agreeButton}
          className={`mt-5 px-10 py-3.5 rounded-full font-display text-base shadow-soft active:scale-90 transition-all ${
            reachedBottom && !stamped
              ? 'bg-rose-500 text-white'
              : stamped
                ? 'bg-rose-300 text-white'
                : 'bg-rose-100 text-rose-300'
          }`}
          style={{ minHeight: '48px' }}
        >
          {CONTENT.terms.agreeButton}
        </motion.button>

        {!reachedBottom && !stamped && (
          <p className="mt-2 font-body text-xs text-rose-300">
            Scroll sampai bawah dulu ya
          </p>
        )}
      </div>
    </SceneShell>
  );
}
