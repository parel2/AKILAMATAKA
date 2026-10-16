import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import PhotoOrPlaceholder from '@/components/PhotoOrPlaceholder';
import { CONTENT } from '@/data/content';
import { captchaPhotos } from '@/data/photos';
import { haptics } from '@/core/haptics';

interface Scene02CaptchaProps {
  onDone: () => void;
}

const FALLBACK_ICONS = ['cat', 'rose', 'star', 'gift', 'cake', 'cloud', 'heart', 'book', 'noodle'];

function FallbackIcon({ type }: { type: string }) {
  switch (type) {
    case 'cat':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <ellipse cx="16" cy="14" rx="6" ry="8" fill="#FFC7D4" />
          <ellipse cx="32" cy="14" rx="6" ry="8" fill="#FFC7D4" />
          <circle cx="24" cy="28" r="16" fill="#FFDFE7" stroke="#FFA3B8" strokeWidth="1.5" />
          <circle cx="19" cy="26" r="2" fill="#5A2A3C" />
          <circle cx="29" cy="26" r="2" fill="#5A2A3C" />
          <path d="M22 32 Q24 34 26 32" stroke="#5A2A3C" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'rose':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <circle cx="24" cy="20" r="12" fill="#F0537D" />
          <circle cx="24" cy="20" r="8" fill="#FF7A9A" />
          <circle cx="24" cy="20" r="4" fill="#FFC7D4" />
          <line x1="24" y1="32" x2="24" y2="44" stroke="#9DBF9E" strokeWidth="2" />
          <path d="M24 38 Q18 36 16 40" stroke="#9DBF9E" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <path d="M24 6 L29 18 L42 20 L32 29 L35 42 L24 35 L13 42 L16 29 L6 20 L19 18z" fill="#FFD56B" stroke="#FFA3B8" strokeWidth="1" />
        </svg>
      );
    case 'gift':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <rect x="10" y="20" width="28" height="22" rx="3" fill="#FFC7D4" stroke="#FF7A9A" strokeWidth="1.5" />
          <rect x="10" y="20" width="28" height="7" rx="3" fill="#FFA3B8" />
          <rect x="21" y="20" width="6" height="22" fill="#F0537D" />
          <ellipse cx="18" cy="18" rx="5" ry="3" fill="#F0537D" />
          <ellipse cx="30" cy="18" rx="5" ry="3" fill="#F0537D" />
        </svg>
      );
    case 'cake':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <rect x="10" y="26" width="28" height="16" rx="4" fill="#FFDFE7" stroke="#FFA3B8" strokeWidth="1.5" />
          <rect x="10" y="22" width="28" height="6" rx="3" fill="#FFC7D4" />
          <rect x="22" y="14" width="4" height="10" fill="#FF7A9A" />
          <ellipse cx="24" cy="11" rx="3" ry="5" fill="#FF6B35" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <ellipse cx="18" cy="28" rx="10" ry="8" fill="#E8F0FE" stroke="#C5D8F0" strokeWidth="1.5" />
          <ellipse cx="30" cy="28" rx="10" ry="8" fill="#E8F0FE" stroke="#C5D8F0" strokeWidth="1.5" />
          <ellipse cx="24" cy="22" rx="8" ry="7" fill="#E8F0FE" stroke="#C5D8F0" strokeWidth="1.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <path d="M24 38 C24 38 8 28 8 18 C8 12 14 8 20 12 C22 13 24 16 24 16 C24 16 26 13 28 12 C34 8 40 12 40 18 C40 28 24 38 24 38z" fill="#F0537D" stroke="#B8325A" strokeWidth="1" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <rect x="12" y="10" width="24" height="30" rx="2" fill="#9DBF9E" stroke="#7A9A7B" strokeWidth="1.5" />
          <line x1="24" y1="10" x2="24" y2="40" stroke="#7A9A7B" strokeWidth="1" />
          <line x1="16" y1="18" x2="21" y2="18" stroke="#FFF" strokeWidth="1" />
          <line x1="16" y1="22" x2="21" y2="22" stroke="#FFF" strokeWidth="1" />
          <line x1="27" y1="18" x2="32" y2="18" stroke="#FFF" strokeWidth="1" />
        </svg>
      );
    case 'noodle':
      return (
        <svg viewBox="0 0 48 48" className="w-full h-full">
          <path d="M10 24 Q10 36 24 36 Q38 36 38 24" fill="none" stroke="#FFD56B" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="24" cy="28" rx="18" ry="12" fill="#FFF5F0" stroke="#FFA3B8" strokeWidth="1.5" />
          <path d="M16 24 Q20 20 24 24 Q28 28 32 24" fill="none" stroke="#F0537D" strokeWidth="2" />
          <path d="M14 18 L18 22 M20 16 L24 20" stroke="#FFD56B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Scene02Captcha({ onDone }: Scene02CaptchaProps) {
  const [phase, setPhase] = useState<'checkbox' | 'grid' | 'result'>('checkbox');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [checkboxEscapes, setCheckboxEscapes] = useState(0);
  const [checkboxPos, setCheckboxPos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showBraveToast, setShowBraveToast] = useState(false);
  const transitionRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Build 9 cells: use captchaPhotos if available, fallback to SVG icons
  const cells = Array.from({ length: 9 }, (_, i) => ({
    id: i,
    photo: captchaPhotos[i] ?? null,
    fallback: FALLBACK_ICONS[i],
  }));

  const handleCheckboxApproach = () => {
    if (checkboxChecked || phase !== 'checkbox') return;
    if (checkboxEscapes < 3) {
      setCheckboxEscapes((prev) => prev + 1);
      haptics(20);
      setCheckboxPos({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 20,
      });
    } else {
      setCheckboxChecked(true);
      haptics([30]);
      setTimeout(() => setPhase('grid'), 600);
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
      // Gimmick: selecting 9th photo shows toast
      if (id === 8 && cells[8].photo) {
        setShowBraveToast(true);
        haptics([15, 15]);
        if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setShowBraveToast(false), 2000);
      }
    }
    setSelected(newSelected);
    haptics(10);
  };

  const handleVerify = () => {
    if (selected.size < 3) return;
    haptics([40, 30, 40]);
    setPhase('result');
    transitionRef.current = window.setTimeout(() => {
      onDone();
    }, 2200);
  };

  return (
    <SceneShell>
      <div className="flex flex-col items-center justify-center w-full max-w-sm" style={{ minHeight: '60vh' }}>
        <h2 className="font-display text-2xl text-ink text-center mb-6">
          {CONTENT.captcha.title}
        </h2>

        {phase === 'checkbox' && (
          <div className="bg-white rounded-sticker shadow-soft p-5 w-full max-w-xs border-2 border-rose-100">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ x: checkboxPos.x, y: checkboxPos.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onPointerEnter={handleCheckboxApproach}
                onPointerDown={handleCheckboxApproach}
                className="w-7 h-7 rounded border-2 border-rose-300 flex items-center justify-center cursor-pointer bg-rose-50"
              >
                {checkboxChecked && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 text-rose-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </motion.div>
              <span className="font-body text-sm text-ink">
                {CONTENT.captcha.checkboxLabel}
              </span>
            </div>
            {checkboxEscapes > 0 && !checkboxChecked && (
              <p className="mt-3 font-hand text-base text-rose-400">
                {CONTENT.captcha.checkboxTease}
              </p>
            )}
          </div>
        )}

        {phase === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-sticker shadow-soft p-4 w-full max-w-xs border-2 border-rose-100"
          >
            <p className="font-body text-sm text-ink text-center mb-3">
              {CONTENT.captcha.gridInstruction}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {cells.map((cell) => (
                <button
                  key={cell.id}
                  onPointerDown={() => toggleSelect(cell.id)}
                  aria-label={`Pilih foto ${cell.id + 1}`}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all active:scale-95 ${
                    selected.has(cell.id)
                      ? 'border-rose-400 border-[3px]'
                      : 'border-white'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {cell.photo ? (
                    <PhotoOrPlaceholder
                      src={cell.photo}
                      alt={`Foto ${cell.id + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-50 p-1.5">
                      <FallbackIcon type={cell.fallback} />
                    </div>
                  )}

                  {/* Selected overlay */}
                  {selected.has(cell.id) && (
                    <div className="absolute inset-0 bg-rose-400/25 pointer-events-none" />
                  )}

                  {/* Check badge */}
                  <AnimatePresence>
                    {selected.has(cell.id) && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shadow-soft pointer-events-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>

            {/* Brave toast */}
            <AnimatePresence>
              {showBraveToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-3 text-center"
                >
                  <span className="inline-block bg-rose-100 text-rose-500 font-hand text-sm px-4 py-1.5 rounded-full">
                    JANGAN DIBORONG DONG.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onPointerDown={handleVerify}
              disabled={selected.size < 3}
              aria-label="Verifikasi"
              className={`w-full py-3 rounded-full font-display text-base transition-all active:scale-95 ${
                selected.size >= 3
                  ? 'bg-rose-500 text-white shadow-soft'
                  : 'bg-rose-100 text-rose-300'
              }`}
            >
              {CONTENT.captcha.verifyButton}
            </button>
            {selected.size < 3 && (
              <p className="mt-2 text-center font-body text-xs text-rose-300">
                Pilih minimal 3 foto
              </p>
            )}
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-sticker shadow-soft p-6 max-w-xs border-2 border-rose-100 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="mb-3"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto">
                <circle cx="24" cy="24" r="20" fill="#9DBF9E" />
                <path d="M14 24 L21 31 L34 16" stroke="#FFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </motion.div>
            <p className="font-body text-sm text-ink">
              {CONTENT.captcha.result}
            </p>
          </motion.div>
        )}
      </div>
    </SceneShell>
  );
}
