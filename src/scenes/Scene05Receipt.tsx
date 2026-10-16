import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';

interface Scene05ReceiptProps {
  onDone: () => void;
}

export default function Scene05Receipt({ onDone }: Scene05ReceiptProps) {
  const [printedLines, setPrintedLines] = useState(0);
  const [showStamp, setShowStamp] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const totalLines = CONTENT.receipt.lines.length + 2; // lines + footer + stamp

  const printNext = useCallback(() => {
    setPrintedLines((prev) => {
      const next = prev + 1;
      haptics(8);

      if (next >= totalLines) {
        setTimeout(() => setShowStamp(true), 400);
        setTimeout(() => setShowButton(true), 1400);
        return totalLines;
      }

      timerRef.current = window.setTimeout(printNext, 450);
      return next;
    });
  }, [totalLines]);

  useEffect(() => {
    timerRef.current = window.setTimeout(printNext, 600);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [printNext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [printedLines]);

  return (
    <SceneShell
      background="linear-gradient(170deg, #FFF8EE 0%, #FFE4EA 100%)"
      scrollable
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Receipt paper */}
        <div
          ref={scrollRef}
          className="relative w-full max-w-[280px] bg-cream rounded-lg shadow-soft-lg overflow-y-auto scrollable"
          style={{
            maxHeight: '55vh',
            borderTop: 'none',
          }}
        >
          {/* Serrated top edge */}
          <svg className="absolute top-0 left-0 right-0 w-full" height="8" viewBox="0 0 280 8" preserveAspectRatio="none">
            <path d="M0 8 L8 0 L16 8 L24 0 L32 8 L40 0 L48 8 L56 0 L64 8 L72 0 L80 8 L88 0 L96 8 L104 0 L112 8 L120 0 L128 8 L136 0 L144 8 L152 0 L160 8 L168 0 L176 8 L184 0 L192 8 L200 0 L208 8 L216 0 L224 8 L232 0 L240 8 L248 0 L256 8 L264 0 L272 8 L280 0 L280 8 Z" fill="#FFF8EE" />
          </svg>

          <div className="px-4 pt-4 pb-6">
            {/* Header */}
            <div className="text-center mb-3 border-b border-dashed border-rose-300 pb-3">
              <p className="font-mono text-sm font-bold text-ink tracking-wide">
                {CONTENT.receipt.header}
              </p>
              <p className="font-mono text-[10px] text-ink-soft mt-1">
                {CONTENT.receipt.subheader}
              </p>
              <p className="font-mono text-[10px] text-ink-soft mt-1">
                {CONTENT.birthday.dateLabel}
              </p>
            </div>

            {/* Lines */}
            <div className="space-y-1.5">
              {CONTENT.receipt.lines.slice(0, printedLines).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-baseline font-mono text-[11px] text-ink"
                >
                  <span className="flex-1 truncate pr-2">{line.label}</span>
                  <span className="text-rose-500 font-bold text-right">{line.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {printedLines > CONTENT.receipt.lines.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 pt-3 border-t border-dashed border-rose-300"
              >
                <p className="font-mono text-[10px] text-ink-soft text-center leading-relaxed">
                  {CONTENT.receipt.footer}
                </p>
              </motion.div>
            )}

            {/* Stamp */}
            <AnimatePresence>
              {showStamp && (
                <motion.div
                  initial={{ scale: 3, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: -12, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="absolute top-32 right-4 border-3 border-rose-500 rounded-lg px-3 py-1"
                  style={{ borderWidth: '3px', borderColor: '#F0537D' }}
                >
                  <span className="font-display text-xl font-bold text-rose-500 opacity-80">
                    {CONTENT.receipt.stamp}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Serrated bottom edge */}
          <svg className="absolute bottom-0 left-0 right-0 w-full rotate-180" height="8" viewBox="0 0 280 8" preserveAspectRatio="none">
            <path d="M0 8 L8 0 L16 8 L24 0 L32 8 L40 0 L48 8 L56 0 L64 8 L72 0 L80 8 L88 0 L96 8 L104 0 L112 8 L120 0 L128 8 L136 0 L144 8 L152 0 L160 8 L168 0 L176 8 L184 0 L192 8 L200 0 L208 8 L216 0 L224 8 L232 0 L240 8 L248 0 L256 8 L264 0 L272 8 L280 0 L280 8 Z" fill="#FFF8EE" />
          </svg>
        </div>

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
