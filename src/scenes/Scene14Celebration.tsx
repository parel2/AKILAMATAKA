import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import PhotoOrPlaceholder from '@/components/PhotoOrPlaceholder';
import { CONTENT } from '@/data/content';
import { cardPhoto, galleryPhotos } from '@/data/photos';
import { AudioManager } from '@/core/AudioManager';
import { haptics } from '@/core/haptics';
import confetti from 'canvas-confetti';

interface Scene14CelebrationProps {
  onRestart: () => void;
}

type Phase = 'burst' | 'status' | 'card' | 'closing' | 'final' | 'done';

export default function Scene14Celebration({ onRestart }: Scene14CelebrationProps) {
  const [phase, setPhase] = useState<Phase>('burst');
  const [statusStruck, setStatusStruck] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [closingIndex, setClosingIndex] = useState(-1);
  const [showFinal, setShowFinal] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const phaseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Crossfade audio
    AudioManager.crossfadeToAfter(CONTENT.audio.crossfadeMs);

    // 2. Confetti burst from bottom
    const fireConfetti = () => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 1 },
        colors: ['#FFA3B8', '#FF7A9A', '#F0537D', '#FFC7D4', '#FFF8EE'],
        scalar: 0.9,
        angle: -90,
      });
      confetti({
        particleCount: 40,
        spread: 120,
        origin: { x: 0.2, y: 1 },
        colors: ['#FFA3B8', '#FF7A9A', '#F0537D'],
        scalar: 0.7,
        angle: -70,
      });
      confetti({
        particleCount: 40,
        spread: 120,
        origin: { x: 0.8, y: 1 },
        colors: ['#FFA3B8', '#FF7A9A', '#F0537D'],
        scalar: 0.7,
        angle: -110,
      });
    };
    fireConfetti();
    haptics([60, 40, 60]);

    // Timeline
    phaseTimerRef.current = window.setTimeout(() => setPhase('status'), 1000);
    const t2 = window.setTimeout(() => {
      setStatusStruck(true);
    }, 2200);
    const t3 = window.setTimeout(() => {
      setStatusChanged(true);
      haptics([40, 30]);
    }, 3000);
    const t4 = window.setTimeout(() => setPhase('card'), 3800);
    const t5 = window.setTimeout(() => {
      setStamped(true);
      haptics([50, 30, 50]);
    }, 4800);
    const t6 = window.setTimeout(() => setPhase('closing'), 5500);

    return () => {
      if (phaseTimerRef.current !== null) clearTimeout(phaseTimerRef.current);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // Closing lines appear one by one
  useEffect(() => {
    if (phase !== 'closing') return;
    const lines = CONTENT.celebration.closing;
    let i = 0;
    setClosingIndex(0);

    const showNext = () => {
      i++;
      if (i < lines.length) {
        setClosingIndex(i);
        phaseTimerRef.current = window.setTimeout(showNext, 1200);
      } else {
        phaseTimerRef.current = window.setTimeout(() => {
          setPhase('final');
          setShowFinal(true);
        }, 1500);
      }
    };

    phaseTimerRef.current = window.setTimeout(showNext, 1200);

    return () => {
      if (phaseTimerRef.current !== null) clearTimeout(phaseTimerRef.current);
    };
  }, [phase]);

  // Final line dramatic pause, then replay button
  useEffect(() => {
    if (!showFinal) return;
    haptics([30]);
    const t1 = window.setTimeout(() => {
      setPhase('done');
      setShowReplay(true);
    }, 3000);
    return () => clearTimeout(t1);
  }, [showFinal]);

  const handleRestart = useCallback(() => {
    haptics(20);
    onRestart();
  }, [onRestart]);

  const handleCardFlip = useCallback(() => {
    haptics(15);
    setFlipped((prev) => !prev);
  }, []);

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFC7D4 0%, #FFE4EA 30%, #FFF8EE 70%, #FFF5F7 100%)"
      scrollable
    >
      <div className="w-full max-w-sm flex flex-col items-center py-4">
        {/* Status animation */}
        <AnimatePresence>
          {phase === 'status' || phase === 'card' || phase === 'closing' || phase === 'final' || phase === 'done' ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <div className="relative inline-block">
                {!statusChanged ? (
                  <motion.span
                    animate={statusStruck ? { opacity: 0.4 } : {}}
                    className="font-display text-2xl text-ink-soft"
                  >
                    {CONTENT.celebration.hts}
                  </motion.span>
                ) : null}

                {/* Strikethrough animation */}
                {statusStruck && !statusChanged && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 origin-left"
                  />
                )}

                {/* New status */}
                {statusChanged && (
                  <motion.div
                    initial={{ scale: 2, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-display text-3xl font-bold text-rose-500">
                      {CONTENT.celebration.newStatus}
                    </span>
                    <motion.svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="#F0537D"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <path d="M12 21 C12 21 3 14 3 8.5 C3 5.5 5.5 3 8.5 3 C10 3 11.5 4 12 5.5 C12.5 4 14 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14 12 21 12 21z" />
                    </motion.svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ID Card */}
        <AnimatePresence>
          {(phase === 'card' || phase === 'closing' || phase === 'final' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: -10 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
              style={{ perspective: 1000 }}
            >
              <motion.div
                onClick={handleCardFlip}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-[260px] h-[360px] cursor-pointer"
                aria-label="Kartu Tanda Pacar Resmi, tap untuk membalik"
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl shadow-soft-lg p-5 border-4 border-white"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="text-center mb-3">
                    <p className="font-display text-xs text-rose-400 uppercase tracking-wider">
                      {CONTENT.celebration.cardTitle}
                    </p>
                    <div className="h-0.5 bg-rose-300 mx-auto w-3/4 mt-1" />
                  </div>

                  {/* Photo */}
                  <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-white shadow-soft mb-3">
                    <PhotoOrPlaceholder
                      src={cardPhoto ?? galleryPhotos[0] ?? ''}
                      alt="Foto Milea"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-center">
                    <p className="font-display text-lg text-ink">{CONTENT.celebration.cardName}</p>
                    <p className="font-body text-xs text-ink-soft">Status: {CONTENT.celebration.cardStatus}</p>
                    <p className="font-body text-xs text-ink-soft">{CONTENT.celebration.cardDate}</p>
                    <p className="font-mono text-[10px] text-rose-400 mt-2">No. Seri: {CONTENT.celebration.cardSerial}</p>
                  </div>

                  {/* Stamp */}
                  <AnimatePresence>
                    {stamped && (
                      <motion.div
                        initial={{ scale: 4, rotate: -25, opacity: 0 }}
                        animate={{ scale: 1, rotate: -15, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="absolute bottom-4 right-4 pointer-events-none"
                      >
                        <div
                          className="border-3 rounded-lg px-2 py-1"
                          style={{ borderWidth: '3px', borderColor: '#F0537D' }}
                        >
                          <span className="font-display text-sm font-bold text-rose-500 opacity-80">
                            {CONTENT.celebration.cardStamp}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Flip hint */}
                  <p className="absolute bottom-2 left-0 right-0 text-center font-body text-[10px] text-rose-300">
                    tap untuk balik
                  </p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-rose-200 to-rose-300 rounded-2xl shadow-soft-lg p-5 border-4 border-white flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#FFF" className="mx-auto mb-3 opacity-80">
                      <path d="M12 21 C12 21 3 14 3 8.5 C3 5.5 5.5 3 8.5 3 C10 3 11.5 4 12 5.5 C12.5 4 14 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14 12 21 12 21z" />
                    </svg>
                    <p className="font-hand text-xl text-white leading-relaxed px-4">
                      {CONTENT.celebration.cardBack}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closing lines */}
        <AnimatePresence>
          {(phase === 'closing' || phase === 'final' || phase === 'done') && (
            <div className="text-center space-y-1 mb-6 px-4">
              {CONTENT.celebration.closing.slice(0, closingIndex + 1).map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-hand text-lg text-ink leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Final line */}
        <AnimatePresence>
          {(phase === 'final' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2 }}
              className="text-center mb-8 px-4"
            >
              <p className="font-display text-xl text-rose-500 leading-relaxed">
                {CONTENT.celebration.finalLine}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replay button */}
        <AnimatePresence>
          {showReplay && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              whileHover={{ opacity: 1 }}
              onPointerDown={handleRestart}
              className="font-body text-xs text-ink-soft underline"
              aria-label={CONTENT.celebration.replayButton}
            >
              {CONTENT.celebration.replayButton}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
